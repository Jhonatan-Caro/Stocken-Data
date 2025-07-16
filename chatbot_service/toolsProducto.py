from typing import List, Optional
from pydantic import BaseModel, Json
from langchain.tools import tool
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import json

# Cargar variables de entorno
load_dotenv()

DB_URI = os.getenv("DB_URI")  # O construye la URI directamente como en tu ejemplo anterior
engine = create_engine(DB_URI)
#os.environ["DB_URI"] = DB_URI

# Modelos de datos
class ProductoCrearInput(BaseModel):
    usuario_id: int
    nombre: str
    precio: float
    stock: int
    caracteristicas: Optional[dict] = {}

class ProductoEditarInput(BaseModel):
    producto_id: int
    usuario_id: int
    nombre: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    caracteristicas: Optional[dict] = None

class ProductoEliminarInput(BaseModel):
    producto_id: int
    usuario_id: int

class ProductoListarInput(BaseModel):
    usuario_id: int

#Crear producto
@tool(args_schema=ProductoCrearInput)
def crear_producto(input: ProductoCrearInput = None, **kwargs) -> str:
    """
    Crea un producto para el usuario especificado.
    """
    if input is None and kwargs:
        input = ProductoCrearInput(**kwargs)
    try:
        caracteristicas_json = json.dumps(input.caracteristicas or {})
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO productos (usuario_id, nombre, precio, stock, caracteristicas)
                    VALUES (:usuario_id, :nombre, :precio, :stock, :caracteristicas)
                """),
                {
                    "usuario_id": input.usuario_id,
                    "nombre": input.nombre,
                    "precio": input.precio,
                    "stock": input.stock,
                    "caracteristicas": caracteristicas_json,  # No agregues ::jsonb aquí, hazlo en el SQL, si quieres
                }
            )
        return f"Producto '{input.nombre}' creado correctamente."
    except Exception as e:
        return f"Error al crear producto: {str(e)}"


# Editar producto
@tool(args_schema=ProductoEditarInput)
def editar_producto(input: ProductoEditarInput = None, **kwargs) -> str:
    """
    Edita un producto solo si pertenece al usuario especificado.
    """
    if input is None and kwargs:
        input = ProductoEditarInput(**kwargs)
    try:
        updates = []
        params = {"producto_id": input.producto_id, "usuario_id": input.usuario_id}
        if input.nombre is not None:
            updates.append("nombre = :nombre")
            params["nombre"] = input.nombre
        if input.precio is not None:
            updates.append("precio = :precio")
            params["precio"] = input.precio
        if input.stock is not None:
            updates.append("stock = :stock")
            params["stock"] = input.stock
        if input.caracteristicas is not None:
            updates.append("caracteristicas = :caracteristicas::jsonb")
            params["caracteristicas"] = json.dumps(input.caracteristicas)
        if not updates:
            return "No se proporcionaron campos para actualizar."
        query = f"UPDATE productos SET {', '.join(updates)} WHERE id = :producto_id AND usuario_id = :usuario_id"
        with engine.begin() as conn:
            result = conn.execute(text(query), params)
        if result.rowcount == 0:
            return "No tienes permiso para editar este producto o el producto no existe."
        return f"Producto con ID {input.producto_id} actualizado correctamente."
    except Exception as e:
        return f"Error al actualizar producto: {str(e)}"


# Eliminar producto
@tool(args_schema=ProductoEliminarInput)
def eliminar_producto(input: ProductoEliminarInput = None, **kwargs) -> str:
    """
    Elimina un producto de la base de datos SOLO si pertenece al usuario.
    """
    # compatibilidad universal: acepta input Pydantic o kwargs
    if input is None and kwargs:
        input = ProductoEliminarInput(**kwargs)
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text("DELETE FROM productos WHERE id = :producto_id AND usuario_id = :usuario_id"),
                {"producto_id": input.producto_id, "usuario_id": input.usuario_id}
            )
        if result.rowcount == 0:
            return "No tienes permiso para eliminar este producto o el producto no existe."
        return f"Producto con ID {input.producto_id} eliminado correctamente."
    except Exception as e:
        return f"Error al eliminar producto: {str(e)}"


# Listar productos de usuario
@tool(args_schema=ProductoListarInput)
def listar_productos(input: ProductoListarInput) -> str:
    """
    Lista los productos de la tabla productos con los datos proporcionados.
    """
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text("SELECT nombre, precio, stock, caracteristicas FROM productos WHERE usuario_id = :usuario_id"),
                {"usuario_id": input.usuario_id}
            )
            productos = result.fetchall()
        if not productos:
            return "No hay productos registrados."
        lines = []
        for nombre, precio, stock, caracteristicas in productos:
            carac_str = json.dumps(caracteristicas) if caracteristicas else "{}"
            lines.append(f"Nombre: {nombre}, Precio: {precio}€, Stock: {stock}, Características: {carac_str}")
        return "\n".join(lines)
    except Exception as e:
        return f"Error al obtener productos: {str(e)}"