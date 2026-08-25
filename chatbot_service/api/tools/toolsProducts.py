from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import tool

from api.clients.stats_client import sales_by_product, StatsBadRequest, StatsUnavailable
from formatting import _money, _pct


class _ProductRankingInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    from_date: Optional[str] = Field(None, description="Inicio del rango 'YYYY-MM' o 'YYYY-MM-DD'. Omitir = sin límite.")
    to_date: Optional[str] = Field(None, description="Fin del rango, inclusive.")
    n: int = Field(5, ge=1, le=50, description="Número de productos a devolver.")


class TopProductsInput(_ProductRankingInput):
    pass


class TopLeastProductsInput(_ProductRankingInput):
    pass


class TopProductsBillingInput(_ProductRankingInput):
    pass


class TopProductsMarginInput(_ProductRankingInput):
    pass


class TopLeastProductsMarginInput(_ProductRankingInput):
    pass


class ProductsByPotentialInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    from_date: Optional[str] = Field(None, description="Inicio del rango 'YYYY-MM' o 'YYYY-MM-DD'.")
    to_date: Optional[str] = Field(None, description="Fin del rango, inclusive.")
    classification: str = Field(
        "potencial",
        description="potencial | nicho_rentable | volumen_sin_margen | no_potencial | sin_datos",
    )


class ProductDetailInput(BaseModel):
    user_id: int = Field(..., description="ID del usuario dueño de los datos.")
    product_name: str = Field(..., description="Nombre (o parte) del producto a consultar.")
    from_date: Optional[str] = Field(None, description="Inicio del rango 'YYYY-MM' o 'YYYY-MM-DD'.")
    to_date: Optional[str] = Field(None, description="Fin del rango, inclusive.")


@tool(args_schema=TopProductsInput)
def top_selling_products(input: TopProductsInput = None, **kwargs) -> str:
    """
    User's top best-selling products (units and billing), optional by date range.

    Use it for product rankings: "what sells the most", "my best products".
    DO NOT use it for temporal evolution (use the summary by month) or to check stock.
    """
    if input is None and kwargs:
        input = TopProductsInput(**kwargs)
    try:
        rows = sales_by_product(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    top = sorted(rows, key=lambda r: r.units, reverse=True)[:input.n]
    text = "Top productos más vendidos:\n"
    for f in top:
        text += f"- {f.product_name}: {f.units} unidades, {_money(f.revenue)}\n"
    return text


@tool(args_schema=TopLeastProductsInput)
def least_selling_products(input: TopLeastProductsInput = None, **kwargs) -> str:
    """
    User's least-selling products (units and billing), optional by date range.

    Use it for product rankings: "what sells the least", "my worst products".
    DO NOT use it for temporal evolution (use the summary by month) or to check stock.
    """
    if input is None and kwargs:
        input = TopLeastProductsInput(**kwargs)
    try:
        rows = sales_by_product(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    worst = sorted([r for r in rows if r.units], key=lambda r: r.units)[:input.n]
    text = "Top productos menos vendidos:\n"
    for f in worst:
        text += f"- {f.product_name}: {f.units} unidades, {_money(f.revenue)}\n"
    return text


@tool(args_schema=TopProductsBillingInput)
def top_billing_products(input: TopProductsBillingInput = None, **kwargs) -> str:
    """
    User's top billing products (units and billing), optional by date range.

    Use it for product rankings: "what bills the most", "my best products".
    DO NOT use it for temporal evolution (use the summary by month) or to check stock.
    """
    if input is None and kwargs:
        input = TopProductsBillingInput(**kwargs)
    try:
        rows = sales_by_product(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    top = sorted(rows, key=lambda r: r.revenue, reverse=True)[:input.n]
    text = "Top productos con mayor facturación:\n"
    for f in top:
        text += f"- {f.product_name}: {f.units} unidades, {_money(f.revenue)}\n"
    return text


@tool(args_schema=TopProductsMarginInput)
def top_margin_products(input: TopProductsMarginInput = None, **kwargs) -> str:
    """
    User's top margin products (margin % and billing), optional by date range.

    Use it for product rankings: "what has the best margin", "my most profitable products".
    DO NOT use it for temporal evolution (use the summary by month) or to check stock.
    """
    if input is None and kwargs:
        input = TopProductsMarginInput(**kwargs)
    try:
        rows = sales_by_product(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    top = sorted([r for r in rows if r.margin_pct is not None], key=lambda r: r.margin_pct, reverse=True)[:input.n]
    text = "Top productos con mayor margen:\n"
    for f in top:
        text += f"- {f.product_name}: {_pct(f.margin_pct)} de margen, {_money(f.margin)}, {_money(f.revenue)}\n"
    return text


@tool(args_schema=TopLeastProductsMarginInput)
def least_margin_products(input: TopLeastProductsMarginInput = None, **kwargs) -> str:
    """
    User's least margin products (margin % and billing), optional by date range.

    Use it for product rankings: "what has the worst margin", "my least profitable products".
    DO NOT use it for temporal evolution (use the summary by month) or to check stock.
    """
    if input is None and kwargs:
        input = TopLeastProductsMarginInput(**kwargs)
    try:
        rows = sales_by_product(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    worst = sorted([r for r in rows if r.margin_pct is not None], key=lambda r: r.margin_pct)[:input.n]
    text = "Top productos con menor margen:\n"
    for f in worst:
        text += f"- {f.product_name}: {_pct(f.margin_pct)} de margen, {_money(f.margin)}, {_money(f.revenue)}\n"
    return text


@tool(args_schema=ProductsByPotentialInput)
def products_by_potential(input: ProductsByPotentialInput = None, **kwargs) -> str:
    """
    Products filtered by their sales classification (potencial, nicho_rentable,
    volumen_sin_margen, no_potencial, sin_datos).

    Use it for recommendations: "which products have potential", "what should I
    push", "which ones sell a lot but leave no margin".
    DO NOT use it for plain rankings (use top/least selling) nor for stock.
    """
    if input is None and kwargs:
        input = ProductsByPotentialInput(**kwargs)
    try:
        rows = sales_by_product(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    selected = [r for r in rows if r.classification == input.classification]
    if not selected:
        return f"No hay productos con clasificación '{input.classification}' en este periodo."
    text = f"Productos con clasificación '{input.classification}':\n"
    for f in selected:
        text += f"- {f.product_name}: {f.units} uds, {_money(f.revenue)}, margen {_pct(f.margin_pct)}\n"
    return text


@tool(args_schema=ProductDetailInput)
def product_detail(input: ProductDetailInput = None, **kwargs) -> str:
    """
    Full sales detail for ONE product the user names: units, billing, cost,
    margin and margin %.

    Use it when the user asks about a specific product: "how is <product> doing",
    "sales of <product>". DO NOT use it for rankings or overall summaries.
    """
    if input is None and kwargs:
        input = ProductDetailInput(**kwargs)
    try:
        rows = sales_by_product(input.user_id, input.from_date, input.to_date)
    except StatsBadRequest as e:
        return f"Parámetros inválidos: {e}"
    except StatsUnavailable:
        return ("El servicio de estadísticas no está disponible ahora mismo. "
                "Pide al usuario que lo intente en unos minutos.")
    if not rows:
        return "No hay ventas registradas en este periodo."
    q = input.product_name.lower()
    matches = [r for r in rows if r.product_name and q in r.product_name.lower()]
    if not matches:
        return f"No encontré ningún producto que coincida con '{input.product_name}'."
    text = ""
    for f in matches:
        text += (
            f"{f.product_name}:\n"
            f"  - Unidades: {f.units}\n"
            f"  - Facturación: {_money(f.revenue)}\n"
            f"  - Coste: {_money(f.cost)}\n"
            f"  - Margen: {_money(f.margin)} ({_pct(f.margin_pct)})\n"
        )
    return text
