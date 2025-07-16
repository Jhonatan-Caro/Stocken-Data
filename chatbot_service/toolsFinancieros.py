from pydantic import BaseModel
from typing import Optional
from langchain.tools import tool
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import json

load_dotenv()

DB_URI = os.getenv("DB_URI")  # O construye la URI directamente como en tu ejemplo anterior
engine = create_engine(DB_URI)

#Top productos mas vendidos
class TopProductosInput(BaseModel):
    usuario_id: int
    desde: Optional[str] = None  # formato YYYY-MM-DD
    hasta: Optional[str] = None  # formato YYYY-MM-DD
    top_n: Optional[int] = 5

@tool(args_schema=TopProductosInput)
def top_productos_vendidos(input: TopProductosInput = None, **kwargs) -> str:
    """
    Devuelve el top N productos más vendidos para el usuario por cantidad y total recaudado,
    opcionalmente en un rango de fechas.
    """
    if input is None and kwargs:
        input = TopProductosInput(**kwargs)
    filtros = ["v.usuario_id = :usuario_id"]
    params = {"usuario_id": input.usuario_id}
    if input.desde:
        filtros.append("v.fecha >= :desde")
        params["desde"] = input.desde
    if input.hasta:
        filtros.append("v.fecha <= :hasta")
        params["hasta"] = input.hasta
    condicion = " AND ".join(filtros)
    query = f"""
        SELECT p.nombre, SUM(v.cantidad) AS total_vendido, SUM(v.cantidad * p.precio) AS total_recaudado
        FROM ventas v
        JOIN productos p ON v.producto_id = p.id
        WHERE {condicion}
        GROUP BY p.nombre
        ORDER BY total_vendido DESC
        LIMIT :top_n
    """
    params['top_n'] = input.top_n
    with engine.begin() as conn:
        result = conn.execute(text(query), params)
        filas = result.fetchall()
    if not filas:
        return "No hay ventas registradas en este periodo."
    texto = "Top productos más vendidos:\n"
    for nombre, total, total_dinero in filas:
        texto += f"- {nombre}: {total} unidades, {total_dinero:.2f} €\n"
    return texto

#Top productos menos vendidos
class BottomProductosInput(BaseModel):
    usuario_id: int
    desde: Optional[str] = None
    hasta: Optional[str] = None
    bottom_n: Optional[int] = 5

@tool(args_schema=BottomProductosInput)
def productos_menos_vendidos(input: BottomProductosInput = None, **kwargs) -> str:
    """
    Devuelve los N productos menos vendidos para el usuario (por unidades).
    """
    if input is None and kwargs:
        input = BottomProductosInput(**kwargs)
    filtros = ["v.usuario_id = :usuario_id"]
    params = {"usuario_id": input.usuario_id}
    if input.desde:
        filtros.append("v.fecha >= :desde")
        params["desde"] = input.desde
    if input.hasta:
        filtros.append("v.fecha <= :hasta")
        params["hasta"] = input.hasta
    condicion = " AND ".join(filtros)
    query = f"""
        SELECT p.nombre, SUM(v.cantidad) AS total_vendido, SUM(v.cantidad * p.precio) AS total_recaudado
        FROM ventas v
        JOIN productos p ON v.producto_id = p.id
        WHERE {condicion}
        GROUP BY p.nombre
        HAVING SUM(v.cantidad) > 0
        ORDER BY total_vendido ASC
        LIMIT :bottom_n
    """
    params['bottom_n'] = input.bottom_n
    with engine.begin() as conn:
        result = conn.execute(text(query), params)
        filas = result.fetchall()
    if not filas:
        return "No hay productos vendidos en este periodo."
    texto = "Productos menos vendidos:\n"
    for nombre, total, total_dinero in filas:
        texto += f"- {nombre}: {total} unidades, {total_dinero:.2f} €\n"
    return texto

#Top fechas con mas ventas
class TopFechasPorProductoInput(BaseModel):
    usuario_id: int
    producto_id: int
    top_n: Optional[int] = 3

@tool(args_schema=TopFechasPorProductoInput)
def fechas_max_ventas_producto(input: TopFechasPorProductoInput = None, **kwargs) -> str:
    """
    Muestra las fechas donde más se vendió un producto.
    """
    if input is None and kwargs:
        input = TopFechasPorProductoInput(**kwargs)
    query = """
        SELECT DATE(v.fecha), SUM(v.cantidad) AS total_vendido
        FROM ventas v
        WHERE v.usuario_id = :usuario_id AND v.producto_id = :producto_id
        GROUP BY DATE(v.fecha)
        ORDER BY total_vendido DESC
        LIMIT :top_n
    """
    with engine.begin() as conn:
        result = conn.execute(text(query), {
            "usuario_id": input.usuario_id,
            "producto_id": input.producto_id,
            "top_n": input.top_n
        })
        rows = result.fetchall()
    if not rows:
        return "No hay ventas para este producto."
    texto = f"Fechas con más ventas para el producto ID {input.producto_id}:\n"
    for fecha, total in rows:
        texto += f"- {fecha}: {total} unidades\n"
    return texto

#Analisis de ventas
class AnalisisVentasInput(BaseModel):
    usuario_id: int
    desde: Optional[str] = None
    hasta: Optional[str] = None

@tool(args_schema=AnalisisVentasInput)
def resumen_ventas(input: AnalisisVentasInput = None, **kwargs) -> str:
    """
    Ofrece un resumen de ventas del usuario: número de ventas, ingresos totales, ticket medio, agrupado por mes.
    """
    if input is None and kwargs:
        input = AnalisisVentasInput(**kwargs)
    filtros = ["v.usuario_id = :usuario_id"]
    params = {"usuario_id": input.usuario_id}
    if input.desde:
        filtros.append("v.fecha >= :desde")
        params["desde"] = input.desde
    if input.hasta:
        filtros.append("v.fecha <= :hasta")
        params["hasta"] = input.hasta
    condicion = " AND ".join(filtros)
    query = f"""
        SELECT TO_CHAR(v.fecha, 'YYYY-MM') as mes, 
               COUNT(*) as num_ventas, 
               SUM(v.cantidad * p.precio) as ingresos, 
               AVG(v.cantidad * p.precio) as ticket_medio
        FROM ventas v
        JOIN productos p ON v.producto_id = p.id
        WHERE {condicion}
        GROUP BY mes
        ORDER BY mes;
    """
    with engine.begin() as conn:
        result = conn.execute(text(query), params)
        rows = result.fetchall()
    if not rows:
        return "No hay ventas registradas."
    texto = "Resumen de ventas por mes:\n"
    for mes, nventas, ingresos, ticket in rows:
        texto += f"- {mes}: {nventas} ventas, {ingresos:.2f} €, ticket medio: {ticket:.2f} €\n"
    return texto

#Prediccion de ventas
@tool(args_schema=AnalisisVentasInput)
def predecir_ventas_siguiente_mes(input: AnalisisVentasInput = None, **kwargs) -> str:
    """
    Predice (de manera básica) los ingresos del próximo mes calculando la media mensual histórica.
    """
    if input is None and kwargs:
        input = AnalisisVentasInput(**kwargs)
    query = """
        SELECT TO_CHAR(v.fecha, 'YYYY-MM') as mes, SUM(v.cantidad * p.precio) as ingresos
        FROM ventas v
        JOIN productos p ON v.producto_id = p.id
        WHERE v.usuario_id = :usuario_id
        GROUP BY mes
        ORDER BY mes
    """
    with engine.begin() as conn:
        result = conn.execute(text(query), {"usuario_id": input.usuario_id})
        rows = result.fetchall()
    if not rows:
        return "No hay ventas históricas suficientes."
    ingresos_mensuales = [float(r[1]) for r in rows]
    promedio = sum(ingresos_mensuales)/len(ingresos_mensuales)
    return f"Según tu historial, el ingreso estimado para el próximo mes sería aproximadamente {promedio:.2f} €."