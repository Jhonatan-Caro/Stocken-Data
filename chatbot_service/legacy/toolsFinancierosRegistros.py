from pydantic import BaseModel
from typing import Optional
from langchain.tools import tool
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import json

load_dotenv()

DB_URI = os.getenv("DB_URI") 
engine = create_engine(DB_URI)

#Top registro mas vendido
class TopRegistrosInput(BaseModel):
    usuario_id: int
    desde: Optional[str] = None
    hasta: Optional[str] = None
    top_n: Optional[int] = 5

@tool(args_schema=TopRegistrosInput)
def top_registros_vendidos(input: TopRegistrosInput = None, **kwargs) -> str:
    """
    Devuelve el top N 'registros dinámicos' más vendidos, agrupados por el campo 'nombre' dentro de datos.
    """
    if input is None and kwargs:
        input = TopRegistrosInput(**kwargs)
    filtros = ["v.user_id = :user_id"]
    params = {"user_id": input.usuario_id}
    if input.desde:
        filtros.append("v.created_at >= :desde")
        params["desde"] = input.desde
    if input.hasta:
        filtros.append("v.created_at <= :hasta")
        params["hasta"] = input.hasta
    condicion = " AND ".join(filtros)
    query = f"""
        SELECT r.data->>'name' as name, SUM(v.quantity) as total_sale
        FROM sales v
        JOIN dynamic_records r ON v.record_id = r.id
        WHERE {condicion}
        GROUP BY name
        ORDER BY total_sale DESC
        LIMIT :top_n
    """
    params['top_n'] = input.top_n
    with engine.begin() as conn:
        filas = conn.execute(text(query), params).fetchall()
    if not filas:
        return "No hay ventas registradas sobre registros dinámicos en este periodo."
    texto = "Top registros dinámicos más vendidos:\n"
    for nombre, total in filas:
        texto += f"- {nombre}: {total} veces\n"
    return texto

#Top registro menos vendido
@tool(args_schema=TopRegistrosInput)
def registros_menos_vendidos(input: TopRegistrosInput = None, **kwargs) -> str:
    """
    Devuelve los N registros dinámicos menos vendidos, agrupados por 'nombre' en datos.
    """
    if input is None and kwargs:
        input = TopRegistrosInput(**kwargs)
    # ... filtros y params igual que antes
    query = f"""
        SELECT r.data->>'name' as name, SUM(v.quantity) as total_sale
        FROM sales v
        JOIN dynamic_records r ON v.record_id = r.id
        WHERE {condicion}
        GROUP BY name
        HAVING SUM(v.quantity) > 0
        ORDER BY total_sale ASC
        LIMIT :top_n
    """
    params['top_n'] = input.top_n
    with engine.begin() as conn:
        filas = conn.execute(text(query), params).fetchall()
    if not filas:
        return "No hay ventas registradas sobre registros dinámicos en este periodo."
    texto = "Registros dinámicos menos vendidos:\n"
    for nombre, total in filas:
        texto += f"- {nombre}: {total} veces\n"
    return texto

#Fechas con mas ventas
class FechasMaxRegistroInput(BaseModel):
    usuario_id: int
    nombre: str  # nombre dentro de datos JSON
    top_n: Optional[int] = 3

@tool(args_schema=FechasMaxRegistroInput)
def fechas_max_ventas_registro(input: FechasMaxRegistroInput = None, **kwargs) -> str:
    """
    Muestra las fechas donde más se vendió un registro dinámico por su nombre.
    """
    if input is None and kwargs:
        input = FechasMaxRegistroInput(**kwargs)
    query = """
        SELECT DATE(v.created_at), SUM(v.quantity) as total_sale
        FROM sales v
        JOIN dynamic_records r ON v.record_id = r.id
        WHERE v.user_id = :user_id AND r.data->>'name' = name
        GROUP BY DATE(v.created_at)
        ORDER BY total_sale DESC
        LIMIT :top_n
    """
    with engine.begin() as conn:
        rows = conn.execute(text(query), {
            "user_id": input.usuario_id,
            "name": input.nombre,
            "top_n": input.top_n
        }).fetchall()
    if not rows:
        return "No hay ventas para este registro."
    texto = f"Fechas con más ventas para el registro '{input.nombre}':\n"
    for fecha, total in rows:
        texto += f"- {fecha}: {total} ventas\n"
    return texto

#Resumen de venta por categoria
class ResumenCategoriaInput(BaseModel):
    usuario_id: int
    categoria_id: int  # ID de la categoria dinamica

@tool(args_schema=ResumenCategoriaInput)
def resumen_ventas_por_categoria(input: ResumenCategoriaInput = None, **kwargs) -> str:
    """
    Ofrece un resumen de cuántos registros se han vendido en una categoría dinámica específica.
    """
    if input is None and kwargs:
        input = ResumenCategoriaInput(**kwargs)
    query = """
        SELECT r.data->>'name' as name, SUM(v.quantity) as total_sale
        FROM sales v
        JOIN dynamic_records r ON v.record_id = r.id
        WHERE v.user_id = :user_id AND r.category_id = :category_id
        GROUP BY name
        ORDER BY total_sale DESC
    """
    with engine.begin() as conn:
        filas = conn.execute(text(query), {
            "usuario_id": input.usuario_id,
            "categoria_id": input.categoria_id
        }).fetchall()
    if not filas:
        return "No hay ventas registradas para esta categoría."
    texto = "Resumen de ventas para la categoría seleccionada:\n"
    for nombre, total in filas:
        texto += f"- {nombre}: {total} ventas\n"
    return texto