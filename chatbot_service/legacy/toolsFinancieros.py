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

#Se crea el modelo encargado de almacenar los datos de entrada para el tool
class TopProductsInput(BaseModel):
    usuario_id: int
    from: Optional[str] = None  # formato YYYY-MM-DD
    until: Optional[str] = None  # formato YYYY-MM-DD
    top_n: Optional[int] = 5

#Se crea el tool encargado de indicar la estructura al modelo de IA,
#al mismo tiempo convierte la funcion top_products_sold en un tool que puede ser llamado por el modelo.
@tool(args_schema=TopProductsInput)
#Se recibe como parametro el objeto  de entrada TopProductsInput, que contiene los datos necesarios para realizar la consulta.
#**kwargs permite recibir argumentos adicionales que se pueden pasar a la función.
def top_products_sold(input: TopProductsInput = None, **kwargs) -> str:
    """
    Returns the top N best-selling products for the user by quantity and total revenue,
    optionally within a date range.
    """
    #Si es None, se crea un objeto TopProductsInput con los argumentos adicionales.
    if input is None and kwargs:
        input = TopProductsInput(**kwargs)
    #Se crean las condiciones de filtrado y los parámetros para la consulta SQL.
    #Todas las consultas se filtran por el ID del usuario, y opcionalmente por un rango de fechas.
    filters = ["v.user_id = :user_id"]
    params = {"user_id": input.user_id}
    if input.from:
        filters.append("v.sold_at >= :from")      # antes: v.created_at
        params["from"] = input.from
    if input.until:
        filters.append("v.sold_at <= :until")
        params["until"] = input.until
    #Al final se unen las condiciones con "AND" para formar la cláusula WHERE de la consulta SQL.
    condition = " AND ".join(filters)
    query = f"""
        SELECT 
            COALESCE(p.data->>'nombre', p.data->>'producto',
                    p.data->>'name', p.data->>'descripcion') AS
                    nombre,
            SUM(v.quantity)::int AS total_sale,
            SUM(v.total)::float AS total_collected
        FROM sales v
        JOIN products p ON p.id = v.product_id
        WHERE {condition}
        GROUP BY p.id
        ORDER BY total_sale DESC
        LIMIT :top_n
    """
    #Se añade el parametro top_n a los parámetros de la consulta.
    params['top_n'] = input.top_n
    #Se utiliza engine para conectarse a la base de datos, mientras el with se asegura de que la conexión se cierre automáticamente al finalizar.
    #A esto se le conoce como contexto transactional, ya que se asegura de que todas las operaciones dentro del bloque se ejecuten como una transacción.
    with engine.begin() as conn:
    #se crea un objeto utilizando la función text de SQLAlchemy, que permite ejecutar consultas SQL en bruto.
    #Mientras que params es un diccionario que contiene los valores de los parámetros que se van a pasar a la consulta SQL.
        result = conn.execute(text(query), params)
    #Se obtienen todas las filas resultantes de la consulta y se almacenan en la variable rows.
        rows = result.fetchall()
    if not rows:
        return "There are no sales recorded in this period."
    #Se crea la variable text que contendrá el texto de salida del tool, y se inicializa con un encabezado.
    text = "Top best-selling products:\n"
    #Se recorren las filas resultantes de la consulta y se van agregando al texto de salida, formateando cada fila con el nombre del producto, la cantidad total vendida y el total recaudado.
    #2f indica que el total recaudado se formateará con dos decimales.
    for name, total, total_money in rows:
        text += f"- {name}: {total} units, {total_money:.2f} €\n"
    return text


#Top productos menos vendidos
class BottomProductsInput(BaseModel):
    user_id: int
    from: Optional[str] = None
    until: Optional[str] = None
    bottom_n: Optional[int] = 5

@tool(args_schema=BottomProductsInput)
def least_selling_products(input: BottomProductsInput = None, **kwargs) -> str:
    """
    Returns the N least selling products for the user (by units).
    """
    if input is None and kwargs:
        input = BottomProductsInput(**kwargs)
    filters = ["v.user_id = :user_id"]
    params = {"user_id": input.user_id}
    if input.from:
        filters.append("v.sold_at >= :from")
        params["from"] = input.from
    if input.until:
        filters.append("v.sold_at <= :until")
        params["until"] = input.until
    condition = " AND ".join(filters)
    query = f"""
        SELECT 
            COALESCE(p.data->>'nombre', p.data->>'producto',
                    p.data->>'name', p.data->>'descripcion') AS
                    nombre,
            SUM(v.quantity)::int AS total_sale,
            SUM(v.total)::float AS total_collected
        FROM sales v
        JOIN products p ON p.id = v.product_id
        WHERE {condition}
        GROUP BY p.id
        ORDER BY total_sale ASC
        LIMIT :bottom_n
    """
    params['bottom_n'] = input.bottom_n
    with engine.begin() as conn:
        result = conn.execute(text(query), params)
        rows = result.fetchall()
    if not rows:
        return "There are no least-selling products recorded in this period."
    texto = "Least-selling products:\n"
    for name, total, total_money in rows:
        texto += f"- {name}: {total} units, {total_money:.2f} €\n"
    return texto

#Top fechas con mas ventas
class TopDateForProductInput(BaseModel):
    user_id: int
    product_id: int
    top_n: Optional[int] = 3

@tool(args_schema=TopDateForProductInput)
def dates_max_sales_product(input: TopDateForProductInput = None, **kwargs) -> str:
    """
    Show the dates where a product was sold the most.
    """
    if input is None and kwargs:
        input = TopDateForProductInput(**kwargs)
    query = """
        SELECT DATE(v.created_at), SUM(v.quantity) AS total_sale
        FROM sales v
        WHERE v.user_id = :user_id AND v.product_id = :product_id
        GROUP BY DATE(v.created_at)
        ORDER BY total_sale DESC
        LIMIT :top_n
    """
    with engine.begin() as conn:
        result = conn.execute(text(query), {
            "user_id": input.user_id,
            "product_id": input.product_id,
            "top_n": input.top_n
        })
        rows = result.fetchall()
    if not rows:
        return "No sales recorded for this product."
    texto = f"Dates with the most sales for product ID {input.product_id}:\n"
    for date, total in rows:
        texto += f"- {date}: {total} units\n"
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
        SELECT TO_CHAR(v.created_at, 'YYYY-MM') as mes, 
               COUNT(*) as num_sales, 
               SUM(v.quantity * p.price) as ingresos, 
               AVG(v.quantity * p.price) as ticket_medio
        FROM sales v
        JOIN products p ON v.product_id = p.id
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
        SELECT TO_CHAR(v.created_at, 'YYYY-MM') as mes, SUM(v.quantity * p.price) as ingresos
        FROM sales v
        JOIN products p ON v.product_id = p.id
        WHERE v.user_id = :user_id
        GROUP BY mes
        ORDER BY mes
    """
    with engine.begin() as conn:
        result = conn.execute(text(query), {"user_id": input.usuario_id})
        rows = result.fetchall()
    if not rows:
        return "No hay ventas históricas suficientes."
    ingresos_mensuales = [float(r[1]) for r in rows]
    promedio = sum(ingresos_mensuales)/len(ingresos_mensuales)
    return f"Según tu historial, el ingreso estimado para el próximo mes sería aproximadamente {promedio:.2f} €."