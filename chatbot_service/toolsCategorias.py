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

# CRUD Categoría Dinámica
class CategoriaCrearInput(BaseModel):
    usuario_id: int
    nombre: str
    descripcion: Optional[str] = None

class CategoriaEditarInput(BaseModel):
    categoria_id: int
    usuario_id: int
    nombre: Optional[str] = None
    descripcion: Optional[str] = None

class CategoriaEliminarInput(BaseModel):
    categoria_id: int
    usuario_id: int

#Crear categoria_dinamica
@tool(args_schema=CategoriaCrearInput)
def crear_categoria(input: CategoriaCrearInput = None, **kwargs):
    """
    Crea una categoría dinámica para el usuario especificado.
    """
    if input is None and kwargs:
        input = CategoriaCrearInput(**kwargs)
    try:
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO categorias_dinamicas (usuario_id, nombre, descripcion) 
                    VALUES (:usuario_id, :nombre, :descripcion)
                """),
                {"usuario_id": input.usuario_id, "nombre": input.nombre, "descripcion": input.descripcion}
            )
        return f"Categoría '{input.nombre}' creada correctamente."
    except Exception as e:
        return f"Error al crear categoría: {str(e)}"

#Editar categoria dinamica
@tool(args_schema=CategoriaEditarInput)
def editar_categoria(input: CategoriaEditarInput = None, **kwargs):
    """
    Edita una categoría solo si pertenece al usuario especificado.
    """
    if input is None and kwargs:
        input = CategoriaEditarInput(**kwargs)
    try:
        updates = []
        params = {"categoria_id": input.categoria_id, "usuario_id": input.usuario_id}
        if input.nombre is not None:
            updates.append("nombre = :nombre")
            params["nombre"] = input.nombre
        if input.descripcion is not None:
            updates.append("descripcion = :descripcion")
            params["descripcion"] = input.descripcion
        if not updates:
            return "No se proporcionaron campos para actualizar."
        query = f"UPDATE categorias_dinamicas SET {', '.join(updates)} WHERE id = :categoria_id AND usuario_id = :usuario_id"
        with engine.begin() as conn:
            result = conn.execute(text(query), params)
        if result.rowcount == 0:
            return "No tienes permiso para editar esta categoría o no existe."
        return f"Categoría con ID {input.categoria_id} editada correctamente."
    except Exception as e:
        return f"Error al editar categoría: {str(e)}"

#Eliminar categoria dinamica
@tool(args_schema=CategoriaEliminarInput)
def eliminar_categoria(input: CategoriaEliminarInput = None, **kwargs):
    """
    Elimina una categoría solo si pertenece al usuario especificado.
    """
    if input is None and kwargs:
        input = CategoriaEliminarInput(**kwargs)
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text("DELETE FROM categorias_dinamicas WHERE id = :categoria_id AND usuario_id = :usuario_id"),
                {"categoria_id": input.categoria_id, "usuario_id": input.usuario_id}
            )
        if result.rowcount == 0:
            return "No tienes permiso para eliminar esta categoría o no existe."
        return f"Categoría con ID {input.categoria_id} eliminada correctamente."
    except Exception as e:
        return f"Error al eliminar categoría: {str(e)}"