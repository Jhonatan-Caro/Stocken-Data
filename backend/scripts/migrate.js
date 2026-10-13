// =====================================================================
// Runner de migraciones — las migraciones son la ÚNICA fuente de verdad
// del esquema (ya no se mantiene init.sql a mano).
//
// La BD recuerda qué migraciones aplicó en la tabla `schema_migrations`.
// El runner descubre los .sql de /migrations, los ordena por nombre y
// aplica solo los que faltan, cada uno en su propia transacción junto
// con su registro (atómico: o se aplica y se registra, o rollback total).
//
// Uso:
//   node scripts/migrate.js up                 aplica las pendientes (default)
//   node scripts/migrate.js status             muestra aplicadas vs pendientes
//   node scripts/migrate.js baseline <archivo> marca una migración como
//                                              aplicada SIN ejecutarla (para
//                                              adoptar una BD que ya tiene ese
//                                              esquema, p.ej. producción)
//
// Convenciones:
//   - Los archivos .sql NO llevan BEGIN/COMMIT: el runner es dueño de la
//     transacción. Si un archivo necesita correr fuera de transacción
//     (p.ej. CREATE INDEX CONCURRENTLY) se nombra "*.no-txn.sql".
//   - Una migración ya aplicada es INMUTABLE: si su checksum cambia, el
//     runner aborta (detección de drift).
// =====================================================================

import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Client } = pkg;

// Clave arbitraria y fija para el advisory lock: serializa runners
// concurrentes (varias instancias del backend arrancando a la vez).
const LOCK_KEY = 8273461923;

const LEDGER_SQL = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename    TEXT PRIMARY KEY,
    checksum    TEXT NOT NULL,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    duration_ms INTEGER NOT NULL DEFAULT 0
  );
`;

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function makeClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}

// Descubre los .sql del nivel superior de /migrations (ignora subcarpetas
// como _archive) y los ordena lexicográficamente: la convención de nombre
// YYYY-MM-DD_... ordena cronológicamente.
async function listMigrationFiles() {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".sql"))
    .map((e) => e.name)
    .sort();
}

async function getApplied(client) {
  const { rows } = await client.query(
    "SELECT filename, checksum FROM schema_migrations",
  );
  return new Map(rows.map((r) => [r.filename, r.checksum]));
}

// Verifica que ninguna migración ya aplicada haya sido editada después.
function assertNoDrift(file, checksum, applied) {
  if (applied.has(file) && applied.get(file) !== checksum) {
    throw new Error(
      `Drift: la migración ya aplicada "${file}" fue modificada ` +
        `(checksum distinto). Las migraciones aplicadas son inmutables: ` +
        `crea una migración nueva en vez de editar esta.`,
    );
  }
}

async function withLock(client, fn) {
  await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
  try {
    return await fn();
  } finally {
    // Si la conexión ya murió, el lock se libera solo al cerrar la sesión.
    await client
      .query("SELECT pg_advisory_unlock($1)", [LOCK_KEY])
      .catch(() => {});
  }
}

async function up() {
  const client = makeClient();
  await client.connect();
  try {
    await withLock(client, async () => {
      await client.query(LEDGER_SQL);
      const files = await listMigrationFiles();
      const applied = await getApplied(client);

      let count = 0;
      for (const file of files) {
        const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
        const checksum = sha256(sql);

        assertNoDrift(file, checksum, applied);
        if (applied.has(file)) continue; // ya aplicada, sin cambios

        const runsInTxn = !file.endsWith(".no-txn.sql");
        const started = Date.now();
        try {
          if (runsInTxn) await client.query("BEGIN");
          await client.query(sql); // protocolo simple: ejecuta el archivo entero
          const duration = Date.now() - started;
          await client.query(
            `INSERT INTO schema_migrations (filename, checksum, duration_ms)
             VALUES ($1, $2, $3)`,
            [file, checksum, duration],
          );
          if (runsInTxn) await client.query("COMMIT");
          console.log(`  applied   ${file}  (${duration} ms)`);
          count++;
        } catch (err) {
          if (runsInTxn) await client.query("ROLLBACK").catch(() => {});
          throw new Error(`Falló "${file}": ${err.message}`);
        }
      }
      console.log(
        count === 0
          ? "Sin migraciones pendientes. Esquema al día."
          : `Listo: ${count} migración(es) aplicada(s).`,
      );
    });
  } finally {
    await client.end();
  }
}

async function status() {
  const client = makeClient();
  await client.connect();
  try {
    await client.query(LEDGER_SQL);
    const files = await listMigrationFiles();
    const applied = await getApplied(client);

    for (const file of files) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      const drift = applied.has(file) && applied.get(file) !== sha256(sql);
      const mark = drift ? "DRIFT!! " : applied.has(file) ? "applied " : "PENDING ";
      console.log(`  ${mark}  ${file}`);
    }
    // Filas de registro sin archivo correspondiente (migración borrada).
    for (const f of applied.keys()) {
      if (!files.includes(f)) console.log(`  MISSING   ${f}  (registrada pero sin archivo)`);
    }
  } finally {
    await client.end();
  }
}

// Marca una migración como aplicada SIN ejecutar su SQL. Sirve para adoptar
// una BD que ya tiene ese esquema (p.ej. producción con el baseline ya creado
// por el antiguo init.sql). Úsalo con cuidado: no valida que el esquema exista.
async function baseline(file) {
  if (!file) {
    throw new Error("Uso: node scripts/migrate.js baseline <archivo.sql>");
  }
  const files = await listMigrationFiles();
  if (!files.includes(file)) {
    throw new Error(`"${file}" no existe en ${MIGRATIONS_DIR}`);
  }
  const client = makeClient();
  await client.connect();
  try {
    await withLock(client, async () => {
      await client.query(LEDGER_SQL);
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      const { rowCount } = await client.query(
        `INSERT INTO schema_migrations (filename, checksum, duration_ms)
         VALUES ($1, $2, 0)
         ON CONFLICT (filename) DO NOTHING`,
        [file, sha256(sql)],
      );
      console.log(
        rowCount === 0
          ? `Ya estaba registrada: ${file}`
          : `baseline  ${file}  (marcada como aplicada, NO ejecutada)`,
      );
    });
  } finally {
    await client.end();
  }
}

const cmd = process.argv[2] || "up";
const commands = { up, status, baseline: () => baseline(process.argv[3]) };

if (!commands[cmd]) {
  console.error(`Comando desconocido: ${cmd}. Usa: up | status | baseline`);
  process.exit(1);
}

commands[cmd]().catch((err) => {
  console.error(`\n✖ ${err.stack || err.message || err}\n`);
  process.exit(1);
});
