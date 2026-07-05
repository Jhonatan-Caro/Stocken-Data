from typing import List, Optional
from pydantic import BaseModel, Json
from langchain.tools import tool
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import json

load_dotenv()

DB_URI = os.getenv("DB_URI")  
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
                    INSERT INTO products (user_id, name, price, stock, features)
                    VALUES (:user_id, :name, :price, :stock, :features::jsonb)
                """),
                {
                    "user_id": input.usuario_id,
                    "name": input.nombre,
                    "price": input.precio,
                    "stock": input.stock,
                    "features": caracteristicas_json,  # No agregues ::jsonb aquí, hazlo en el SQL, si quieres
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
        params = {"product_id": input.producto_id, "user_id": input.usuario_id}
        if input.nombre is not None:
            updates.append("name = :name")
            params["name"] = input.name
        if input.precio is not None:
            updates.append("price = :price")
            params["price"] = input.precio
        if input.stock is not None:
            updates.append("stock = :stock")
            params["stock"] = input.stock
        if input.caracteristicas is not None:
            updates.append("features = :features::jsonb")
            params["features"] = json.dumps(input.caracteristicas)
        if not updates:
            return "No se proporcionaron campos para actualizar."
        query = f"UPDATE products SET {', '.join(updates)} WHERE id = :product_id AND user_id = :user_id"
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
                text("DELETE FROM products WHERE id = :product_id AND user_id = :user_id"),
                {"product_id": input.producto_id, "user_id": input.usuario_id}
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
                text("SELECT name, price, stock, features FROM products WHERE user_id = :user_id"),
                {"user_id": input.usuario_id}
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