from api.config import Config
import logging
import time
from langchain_community.utilities import SQLDatabase

logger = logging.getLogger(__name__)

retries = Config.DB_CONNECT_RETRIES
delay = Config.DB_CONNECT_DELAY

def connect_db():
    """Conecta con la BD reintentando ante fallos transitorios (p. ej. la BD
    aún no está lista o el DNS de Docker todavía no resuelve el host)."""
    last_error = None
    for tried in range(1, retries + 1):
        try:
            return SQLDatabase.from_uri(Config.URI, engine_args={"pool_pre_ping": True})
        except Exception as e:  # noqa: BLE001
            last_error = e
            logger.warning(
                "No se pudo conectar con la BD (intento %s/%s): %s",
                tried, retries, e,
            )
            if tried < retries:
                time.sleep(delay)
    raise RuntimeError(
        f"No se pudo conectar con la base de datos tras {retries} intentos"
    ) from last_error