from typing import List, Optional
from pydantic import BaseModel, Json
from langchain.tools import tool
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import json

# Cargar variables de entorno
load_dotenv()

DB_URI = os.getenv("DB_URI")  
engine = create_engine(DB_URI)

# CRUD Registros Dinámicos
class RegistroCrearInput(BaseModel):
    categoria_id: int
    usuario_id: int
    datos: dict              

class RegistroEditarInput(BaseModel):
    registro_id: int
    usuario_id: int
    datos: dict

class RegistroEliminarInput(BaseModel):
    registro_id: int
    usuario_id: int

#Crear registro
@tool(args_schema=RegistroCrearInput)
def crear_registro_dinamico(input: RegistroCrearInput = None, **kwargs):
    """
    Crea un registro dinámico para una categoría y usuario especificado.
    El campo 'datos' es obligatorio y debe ser un diccionario con los datos a guardar en formato JSON, por ejemplo:
    {'nombre': 'Manzana', 'cantidad': 5, 'precio': 8.90}
    """
    if input is None and kwargs:
        input = RegistroCrearInput(**kwargs)
    try:
        datos_json = json.dumps(input.datos)      # Serializa a JSON string para guardar en JSONB
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO dynamic_records (category_id, user_id, data)
                    VALUES (:category_id, :user_id, :data)
                """),
                {
                    "category_id": input.categoria_id,
                    "user_id": input.usuario_id,
                    "data": datos_json
                }
            )
        return f"Registro guardado correctamente en la categoría {input.categoria_id}."
    except Exception as e:
        return f"Error al crear registro: {str(e)}"

#Editar registro
@tool(args_schema=RegistroEditarInput)
def editar_registro_dinamico(input: RegistroEditarInput = None, **kwargs):
    """
    Edita el registro 'datos' de un registro dinámico solo si pertenece al usuario.
    NOTA: reemplaza el JSON. Si quieres mergear claves, implementa lógica adicional.
    """
    if input is None and kwargs:
        input = RegistroEditarInput(**kwargs)
    try:
        datos_json = json.dumps(input.datos)
        with engine.begin() as conn:
            result = conn.execute(
                text("""
                    UPDATE dynamic_records
                    SET data = :data
                    WHERE id = :record_id AND user_id = :user_id
                """),
                {
                    "data": datos_json,
                    "record_id": input.registro_id,
                    "user_id": input.usuario_id
                }
            )
        if result.rowcount == 0:
            return "No tienes permiso para editar este registro o no existe."
        return f"Registro con ID {input.registro_id} editado correctamente."
    except Exception as e:
        return f"Error al editar registro: {str(e)}"

#Eliminar registro
@tool(args_schema=RegistroEliminarInput)
def eliminar_registro_dinamico(input: RegistroEliminarInput = None, **kwargs):
    """
    Elimina un registro dinámico solo si pertenece al usuario especificado.
    """
    if input is None and kwargs:
        input = RegistroEliminarInput(**kwargs)
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text("DELETE FROM dynamic_records WHERE id = :record_id AND user_id = :user_id"),
                {"record_id": input.registro_id, "user_id": input.usuario_id}
            )
        if result.rowcount == 0:
            return "No tienes permiso para eliminar este registro o no existe."
        return f"Registro con ID {input.registro_id} eliminado correctamente."
    except Exception as e:
        return f"Error al eliminar registro: {str(e)}"
