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

# CRUD Registros Dinámicos
class RegistroCrearInput(BaseModel):
    categoria_id: int
    usuario_id: int
    datos: dict              # ESTE ES EL JSON “libre/variable” que quieres guardar

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
                    INSERT INTO registros_dinamicos (categoria_id, usuario_id, datos)
                    VALUES (:categoria_id, :usuario_id, :datos)
                """),
                {
                    "categoria_id": input.categoria_id,
                    "usuario_id": input.usuario_id,
                    "datos": datos_json
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
                    UPDATE registros_dinamicos 
                    SET datos = :datos
                    WHERE id = :registro_id AND usuario_id = :usuario_id
                """),
                {
                    "datos": datos_json,
                    "registro_id": input.registro_id,
                    "usuario_id": input.usuario_id
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
                text("DELETE FROM registros_dinamicos WHERE id = :registro_id AND usuario_id = :usuario_id"),
                {"registro_id": input.registro_id, "usuario_id": input.usuario_id}
            )
        if result.rowcount == 0:
            return "No tienes permiso para eliminar este registro o no existe."
        return f"Registro con ID {input.registro_id} eliminado correctamente."
    except Exception as e:
        return f"Error al eliminar registro: {str(e)}"
