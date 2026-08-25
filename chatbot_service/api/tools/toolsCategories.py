from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import tool

from api.clients.stats_client import sales_by_category, StatsBadRequest, StatsUnavailable
from formatting import _money, _pct


class CategoryRangeInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    from_date: Optional[str] = Field(None, description="Inicio del rango 'YYYY-MM' o 'YYYY-MM-DD'. Omitir = sin límite.")
    to_date: Optional[str] = Field(None, description="Fin del rango, inclusive.")


class TopCategoriesInput(CategoryRangeInput):
    n: int = Field(5, ge=1, le=50, description="Número de categorías a devolver.")


@tool(args_schema=CategoryRangeInput)
def sales_by_category_tool(input: CategoryRangeInput = None, **kwargs) -> str:
    """
    Sales broken down by category: products, units, billing and margin % per category.

    Use it for: "sales by category", "which category sells the most".
    DO NOT use it for product detail or temporal evolution.
    """
    if input is None and kwargs:
        input = CategoryRangeInput(**kwargs)
    try:
        rows = sales_by_category(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    text = "Ventas por categoría:\n"
    for f in rows:
        text += f"- {f.category}: {f.units} uds, {_money(f.revenue)}, margen {_pct(f.margin_pct)} ({f.products} productos)\n"
    return text


@tool(args_schema=TopCategoriesInput)
def top_categories(input: TopCategoriesInput = None, **kwargs) -> str:
    """
    Top categories by billing.

    Use it for: "my best categories", "top categories by revenue".
    DO NOT use it for product detail or temporal evolution.
    """
    if input is None and kwargs:
        input = TopCategoriesInput(**kwargs)
    try:
        rows = sales_by_category(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    top = sorted(rows, key=lambda r: r.revenue, reverse=True)[:input.n]
    text = "Top categorías por facturación:\n"
    for f in top:
        text += f"- {f.category}: {_money(f.revenue)} ({f.units} uds, {f.products} productos)\n"
    return text


@tool(args_schema=TopCategoriesInput)
def least_margin_categories(input: TopCategoriesInput = None, **kwargs) -> str:
    """
    Categories with the lowest margin %.

    Use it for: "which categories are least profitable", "worst margin categories".
    DO NOT use it for volume ranking (use top categories).
    """
    if input is None and kwargs:
        input = TopCategoriesInput(**kwargs)
    try:
        rows = sales_by_category(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    con_margen = [r for r in rows if r.margin_pct is not None]
    if not con_margen:
        return "No hay datos de margen por categoría en este periodo."
    worst = sorted(con_margen, key=lambda r: r.margin_pct)[:input.n]
    text = "Categorías con menor margen:\n"
    for f in worst:
        text += f"- {f.category}: {_pct(f.margin_pct)} de margen ({_money(f.revenue)})\n"
    return text
