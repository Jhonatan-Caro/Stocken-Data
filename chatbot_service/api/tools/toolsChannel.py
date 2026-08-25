from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import tool

from api.clients.stats_client import sales_by_channel, StatsBadRequest, StatsUnavailable
from formatting import _money, _pct


class ChannelRangeInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    from_date: Optional[str] = Field(None, description="Inicio del rango 'YYYY-MM' o 'YYYY-MM-DD'. Omitir = sin límite.")
    to_date: Optional[str] = Field(None, description="Fin del rango, inclusive.")


@tool(args_schema=ChannelRangeInput)
def sales_by_channel_tool(input: ChannelRangeInput = None, **kwargs) -> str:
    """
    Sales broken down by channel: units, billing and margin % per channel.

    Use it for: "which channels sell the most", "sales by channel", "online vs store".
    DO NOT use it for product/category detail or temporal evolution.
    """
    if input is None and kwargs:
        input = ChannelRangeInput(**kwargs)
    try:
        rows = sales_by_channel(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    text = "Ventas por canal:\n"
    for f in rows:
        text += f"- {f.channel}: {f.units} uds, {_money(f.revenue)}, margen {_pct(f.margin_pct)}\n"
    return text


@tool(args_schema=ChannelRangeInput)
def best_channel(input: ChannelRangeInput = None, **kwargs) -> str:
    """
    The channel with the highest billing in the period.

    Use it for: "my best channel", "where do I sell the most".
    DO NOT use it for the full breakdown (use sales by channel).
    """
    if input is None and kwargs:
        input = ChannelRangeInput(**kwargs)
    try:
        rows = sales_by_channel(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    f = max(rows, key=lambda r: r.revenue)
    return f"Mejor canal: {f.channel} con {_money(f.revenue)} ({f.units} uds, margen {_pct(f.margin_pct)})."


@tool(args_schema=ChannelRangeInput)
def top_margin_channel(input: ChannelRangeInput = None, **kwargs) -> str:
    """
    The channel with the highest margin % in the period.

    Use it for: "which channel is most profitable", "best margin channel".
    DO NOT use it for volume ranking (use best channel).
    """
    if input is None and kwargs:
        input = ChannelRangeInput(**kwargs)
    try:
        rows = sales_by_channel(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    con_margen = [r for r in rows if r.margin_pct is not None]
    if not con_margen:
        return "No hay datos de margen por canal en este periodo."
    f = max(con_margen, key=lambda r: r.margin_pct)
    return f"Canal con mayor margen: {f.channel} con {_pct(f.margin_pct)} ({_money(f.revenue)})."
