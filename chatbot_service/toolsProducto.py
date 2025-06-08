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
    caracteristicas: Optional[dict] = {}  # Se recibe JSON decodificado

class ProductoEditarInput(BaseModel):
    producto_id: int
    nombre: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    caracteristicas: Optional[dict] = None

class ProductoEliminarInput(BaseModel):
    producto_id: int

class ProductoListarInput(BaseModel):
    usuario_id: int

# Crear producto
@tool(args_schema=ProductoCrearInput)
def crear_producto(input: ProductoCrearInput) -> str:
    """
    Crea un producto en la tabla productos con los datos proporcionados.
    """
    try:
        caracteristicas_json = json.dumps(input.caracteristicas or {})
        with engine.begin() as conn:
            query = text("""
                INSERT INTO productos (usuario_id, nombre, precio, stock, caracteristicas)
                VALUES (:usuario_id, :nombre, :precio, :stock, :caracteristicas::jsonb)
            """)
            conn.execute(query, {
                "usuario_id": input.usuario_id,
                "nombre": input.nombre,
                "precio": input.precio,
                "stock": input.stock,
                "caracteristicas": caracteristicas_json
            })
        return f"Producto '{input.nombre}' creado correctamente."
    except Exception as e:
        return f"Error al crear producto: {str(e)}"


# Editar producto
@tool(args_schema=ProductoEditarInput)
def editar_producto(input: ProductoEditarInput) -> str:
    """
    Edita un producto en la tabla productos con los datos proporcionados.
    """
    try:
        updates = []
        params = {"producto_id": input.producto_id}
        
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
            params["caracteristicas"] = json.dumps(input.caracteristicas)
            updates.append("caracteristicas = :caracteristicas::jsonb")
        
        if not updates:
            return "No se proporcionaron campos para actualizar."
        
        query = f"UPDATE productos SET {', '.join(updates)} WHERE id = :producto_id"
        with engine.begin() as conn:
            conn.execute(text(query), params)
        return f"Producto con ID {input.producto_id} actualizado correctamente."
    except Exception as e:
        return f"Error al actualizar producto: {str(e)}"


# Eliminar producto
@tool(args_schema=ProductoEliminarInput)
def eliminar_producto(input: ProductoEliminarInput) -> str:
    """
    Elimina un producto en la tabla productos con los datos proporcionados.
    """
    try:
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM productos WHERE id = :producto_id"), {"producto_id": input.producto_id})
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