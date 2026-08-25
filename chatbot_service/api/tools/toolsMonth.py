from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import tool

from api.clients.stats_client import sales_by_month, StatsBadRequest, StatsUnavailable
from formatting import _money, _pct


class MonthRangeInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    from_date: Optional[str] = Field(None, description="Inicio del rango 'YYYY-MM' o 'YYYY-MM-DD'. Omitir = sin límite.")
    to_date: Optional[str] = Field(None, description="Fin del rango, inclusive.")


class PredictSalesInput(MonthRangeInput):
    n: int = Field(3, ge=1, le=24, description="Número de meses recientes a promediar para la predicción.")


class CompareMonthsInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    month_a: str = Field(..., description="Primer mes a comparar, formato 'YYYY-MM'.")
    month_b: str = Field(..., description="Segundo mes a comparar, formato 'YYYY-MM'.")


@tool(args_schema=MonthRangeInput)
def monthly_sales_evolution(input: MonthRangeInput = None, **kwargs) -> str:
    """
    Month-by-month sales evolution: units, billing, margin % and average ticket.

    Use it for trend questions: "how are sales evolving", "sales this year by month".
    DO NOT use it for product/channel/category detail or overall totals.
    """
    if input is None and kwargs:
        input = MonthRangeInput(**kwargs)
    try:
        rows = sales_by_month(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    text = "Evolución de ventas por mes:\n"
    for f in rows:
        text += f"- {f.mes}: {f.units} uds, {_money(f.revenue)}, margen {_pct(f.margin_pct)}, ticket {_money(f.avg_ticket)}\n"
    return text


@tool(args_schema=MonthRangeInput)
def best_month(input: MonthRangeInput = None, **kwargs) -> str:
    """
    The single month with the highest billing in the period.

    Use it for: "my best month", "when did I sell the most".
    DO NOT use it for full evolution (use monthly evolution) nor product detail.
    """
    if input is None and kwargs:
        input = MonthRangeInput(**kwargs)
    try:
        rows = sales_by_month(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    f = max(rows, key=lambda r: r.revenue)
    return f"Mejor mes: {f.mes} con {_money(f.revenue)} ({f.units} uds, margen {_pct(f.margin_pct)})."


@tool(args_schema=MonthRangeInput)
def worst_month(input: MonthRangeInput = None, **kwargs) -> str:
    """
    The single month with the lowest billing among months with sales.

    Use it for: "my worst month", "when did I sell the least".
    DO NOT use it for full evolution (use monthly evolution) nor product detail.
    """
    if input is None and kwargs:
        input = MonthRangeInput(**kwargs)
    try:
        rows = sales_by_month(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    con_ventas = [r for r in rows if r.units]
    if not con_ventas:
        return "No hay ventas registradas en este periodo."
    f = min(con_ventas, key=lambda r: r.revenue)
    return f"Peor mes: {f.mes} con {_money(f.revenue)} ({f.units} uds, margen {_pct(f.margin_pct)})."


@tool(args_schema=PredictSalesInput)
def predict_next_month_sales(input: PredictSalesInput = None, **kwargs) -> str:
    """
    Rough forecast of next month's billing as the simple average of the last N
    months with sales.

    Use it for: "how much will I sell next month", "estimate next month".
    Explain to the user it's a simple moving average, not a real prediction.
    """
    if input is None and kwargs:
        input = PredictSalesInput(**kwargs)
    try:
        rows = sales_by_month(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    ultimos = rows[-input.n:]
    estimacion = sum(r.revenue for r in ultimos) / len(ultimos)
    meses = ", ".join(r.mes for r in ultimos)
    return (f"Estimación para el próximo mes: {_money(estimacion)} "
            f"(media simple de {len(ultimos)} meses: {meses}).")


@tool(args_schema=CompareMonthsInput)
def compare_months(input: CompareMonthsInput = None, **kwargs) -> str:
    """
    Compare two specific months by billing, units and margin.

    Use it for: "compare June with July", "how did March do versus February".
    DO NOT use it for full evolution or ranges (use monthly evolution).
    """
    if input is None and kwargs:
        input = CompareMonthsInput(**kwargs)
    try:
        rows = sales_by_month(input.user_id)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    por_mes = {r.mes: r for r in rows}
    a = por_mes.get(input.month_a)
    b = por_mes.get(input.month_b)
    if a is None or b is None:
        faltan = [m for m in (input.month_a, input.month_b) if m not in por_mes]
        return f"No hay ventas para: {', '.join(faltan)}."
    dif = b.revenue - a.revenue
    signo = "más" if dif >= 0 else "menos"
    return (
        f"{a.mes}: {_money(a.revenue)} ({a.units} uds, margen {_pct(a.margin_pct)})\n"
        f"{b.mes}: {_money(b.revenue)} ({b.units} uds, margen {_pct(b.margin_pct)})\n"
        f"Diferencia: {_money(abs(dif))} {signo} en {b.mes} que en {a.mes}."
    )
