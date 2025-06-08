from langchain.tools import tool
import json

@tool
def agregar_registro(categoria: str, datos_json: str, usuario_id: int) -> str:
    """Agrega un nuevo registro en la categoría dada. datos_json debe ser un string JSON."""
    query = text("""
        INSERT INTO registros_dinamicos (categoria_id, usuario_id, datos, created_at)
        SELECT id, :usuario_id, :datos::jsonb, NOW()
        FROM categorias_dinamicas 
        WHERE LOWER(nombre) = LOWER(:categoria) AND usuario_id = :usuario_id
    """)
    with db._engine.begin() as conn:
        result = conn.execute(query, {"categoria": categoria, "usuario_id": usuario_id, "datos": datos_json})
    return "Registro agregado correctamente."

@tool
def eliminar_registro(nombre_producto: str, categoria: str, usuario_id: int) -> str:
    """Elimina un registro por nombre de producto y categoría."""
    query = text("""
        DELETE FROM registros_dinamicos
        WHERE usuario_id = :usuario_id
        AND categoria_id = (
            SELECT id FROM categorias_dinamicas 
            WHERE LOWER(nombre) = LOWER(:categoria) AND usuario_id = :usuario_id
        )
        AND datos->>'nombre' = :nombre_producto
    """)
    with db._engine.begin() as conn:
        result = conn.execute(query, {
            "usuario_id": usuario_id,
            "categoria": categoria,
            "nombre_producto": nombre_producto
        })
    return "Registro eliminado." if result.rowcount > 0 else "No se encontró ese producto."

@tool
def editar_registro(nombre_producto: str, categoria: str, nuevos_datos: str, usuario_id: int) -> str:
    """Edita un registro existente. nuevos_datos debe ser un JSON válido."""
    query = text("""
        UPDATE registros_dinamicos
        SET datos = :nuevos_datos::jsonb
        WHERE usuario_id = :usuario_id
        AND categoria_id = (
            SELECT id FROM categorias_dinamicas 
            WHERE LOWER(nombre) = LOWER(:categoria) AND usuario_id = :usuario_id
        )
        AND datos->>'nombre' = :nombre_producto
    """)
    with db._engine.begin() as conn:
        result = conn.execute(query, {
            "usuario_id": usuario_id,
            "categoria": categoria,
            "nombre_producto": nombre_producto,
            "nuevos_datos": nuevos_datos
        })
    return "Registro actualizado." if result.rowcount > 0 else "No se encontró ese producto para actualizar."