from langchain.tools import tool
from sqlalchemy import text

@tool
def crear_categoria(nombre: str, descripcion: str, usuario_id: int) -> str:
    """
    Crea una nueva categoría.
    """
    from chatBot import db
    query = text("INSERT INTO categorias_dinamicas (nombre, descripcion, usuario_id) VALUES (:nombre, :descripcion, :usuario_id)")
    with db.engine.begin() as conn:
        conn.execute(query, {"nombre": nombre, "descripcion": descripcion, "usuario_id": usuario_id})
    return f"Categoría '{nombre}' creada correctamente."

@tool
def obtener_categorias(usuario_id: int) -> str:
    """
    Devuelve todas las categorías del usuario.
    """
    from chatBot import db
    query = text("SELECT nombre, descripcion FROM categorias_dinamicas WHERE usuario_id = :usuario_id")
    with db.engine.begin() as conn:
        result = conn.execute(query, {"usuario_id": usuario_id}).fetchall()
    if not result:
        return "No tienes categorías registradas."
    return "\n".join([f"- Categoría: {r[0]}, Descripción: {r[1]}" for r in result])


@tool
def obtener_productos_por_categoria(categoria: str, usuario_id: int) -> str:
    """Devuelve una lista de productos dentro de una categoría específica para un usuario."""
    query = text("""
        SELECT datos->>'nombre' AS nombre, datos->>'cantidad' AS cantidad 
        FROM registros_dinamicos r
        JOIN categorias_dinamicas c ON r.categoria_id = c.id
        WHERE r.usuario_id = :usuario_id AND LOWER(c.nombre) = LOWER(:categoria)
    """)
    with db._engine.connect() as conn:
        results = conn.execute(query, {"usuario_id": usuario_id, "categoria": categoria}).fetchall()
    if not results:
        return "No hay productos en esa categoría."
    return "\n".join(f"- Nombre: {r[0]}, Cantidad: {r[1]}" for r in results)

@tool
def crear_categoria(nombre: str, descripcion: str, usuario_id: int) -> str:
    """Crea una nueva categoría para el usuario."""
    query = text("""
        INSERT INTO categorias_dinamicas (nombre, descripcion, usuario_id, created_at)
        VALUES (:nombre, :descripcion, :usuario_id, NOW())
    """)
    with db._engine.begin() as conn:
        conn.execute(query, {"nombre": nombre, "descripcion": descripcion, "usuario_id": usuario_id})
    return f"Categoría '{nombre}' creada exitosamente."

@tool
def eliminar_categoria(nombre: str, usuario_id: int) -> str:
    """Elimina una categoría del usuario si existe."""
    query = text("""
        DELETE FROM categorias_dinamicas 
        WHERE LOWER(nombre) = LOWER(:nombre) AND usuario_id = :usuario_id
    """)
    with db._engine.begin() as conn:
        result = conn.execute(query, {"nombre": nombre, "usuario_id": usuario_id})
    return f"Categoría '{nombre}' eliminada." if result.rowcount > 0 else "No se encontró esa categoría."

@tool
def editar_categoria(nombre_actual: str, nuevo_nombre: str, nueva_descripcion: str, usuario_id: int) -> str:
    """Edita el nombre y/o descripción de una categoría existente."""
    query = text("""
        UPDATE categorias_dinamicas
        SET nombre = :nuevo_nombre, descripcion = :nueva_descripcion
        WHERE LOWER(nombre) = LOWER(:nombre_actual) AND usuario_id = :usuario_id
    """)
    with db._engine.begin() as conn:
        result = conn.execute(query, {
            "nombre_actual": nombre_actual,
            "nuevo_nombre": nuevo_nombre,
            "nueva_descripcion": nueva_descripcion,
            "usuario_id": usuario_id
        })
    return f"Categoría actualizada." if result.rowcount > 0 else "No se encontró la categoría para editar."