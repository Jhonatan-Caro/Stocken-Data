from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import tool

from api.clients.stats_client import sales_summary, StatsBadRequest, StatsUnavailable
from formatting import _money, _pct


class _SummaryRangeInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    from_date: Optional[str] = Field(None, description="Inicio del rango 'YYYY-MM' o 'YYYY-MM-DD'. Omitir = sin límite.")
    to_date: Optional[str] = Field(None, description="Fin del rango, inclusive.")


class SummarySales(_SummaryRangeInput):
    pass


class AverageTicket(_SummaryRangeInput):
    pass


class HealthMargin(_SummaryRangeInput):
    pass


@tool(args_schema=SummarySales)
def summary_sales(input: SummarySales = None, **kwargs) -> str:
    """
    Overall sales KPIs: billing (gross/net), units, orders, average ticket,
    margin, margin % and refunds.

    Use it for global questions: "how are my sales going", "total this year".
    DO NOT use it for product/channel/category detail or month evolution.
    """
    if input is None and kwargs:
        input = SummarySales(**kwargs)
    try:
        s = sales_summary(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if s.units == 0 and s.orders == 0:
        return "No hay ventas registradas en este periodo."
    return (
        "Resumen de ventas:\n"
        f"- Facturación: {_money(s.revenue)} (neto {_money(s.revenue_net)})\n"
        f"- Unidades: {s.units}\n"
        f"- Pedidos: {s.orders}, ticket medio {_money(s.avg_ticket)}\n"
        f"- Margen: {_money(s.margin)} ({_pct(s.margin_pct)})\n"
        f"- Reembolsado: {_money(s.refunded)}\n"
    )


@tool(args_schema=AverageTicket)
def average_ticket(input: AverageTicket = None, **kwargs) -> str:
    """
    Average ticket (billing per order) and number of orders.

    Use it for: "what's my average ticket", "average order value".
    DO NOT use it for full KPIs (use summary) or product detail.
    """
    if input is None and kwargs:
        input = AverageTicket(**kwargs)
    try:
        s = sales_summary(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if s.orders == 0:
        return "No hay pedidos registrados en este periodo."
    return f"Ticket medio: {_money(s.avg_ticket)} sobre {s.orders} pedidos."


@tool(args_schema=HealthMargin)
def health_margin(input: HealthMargin = None, **kwargs) -> str:
    """
    Profitability health: margin, margin % and refunds over billing.

    Use it for: "am I profitable", "how healthy are my margins", "refund weight".
    DO NOT use it for product/channel margin detail.
    """
    if input is None and kwargs:
        input = HealthMargin(**kwargs)
    try:
        s = sales_summary(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if s.revenue == 0:
        return "No hay ventas registradas en este periodo."
    peso_reembolsos = s.refunded / s.revenue if s.revenue else 0
    return (
        f"Margen: {_money(s.margin)} ({_pct(s.margin_pct)}).\n"
        f"Reembolsos: {_money(s.refunded)} ({_pct(peso_reembolsos)} de la facturación)."
    )
