from typing import Optional
from pydantic import BaseModel, ConfigDict

class SummaryRow(BaseModel):
    model_config = ConfigDict(extra="ignore")

    units: int
    revenue: float
    revenue_net: float
    cost: float
    margin: float
    margin_pct: Optional[float] = None
    orders: int
    refunded: float
    avg_ticket: float


class ByProductRow(BaseModel):
    model_config = ConfigDict(extra="ignore")

    classification: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    units: int
    orders: int
    revenue: float
    cost: Optional[float] = None
    margin: Optional[float] = None
    margin_pct: Optional[float] = None


class ByMonthRow(BaseModel):
    model_config = ConfigDict(extra="ignore")

    mes: str
    units: int
    revenue: float
    revenue_net: Optional[float] = None
    cost: Optional[float] = None
    margin: Optional[float] = None
    margin_pct: Optional[float] = None
    orders: int
    refunded: float
    avg_ticket: Optional[float] = None


class ByChannelRow(BaseModel):
    model_config = ConfigDict(extra="ignore")

    channel: str
    units: int
    orders: int
    revenue: float
    margin: Optional[float] = None
    margin_pct: Optional[float] = None


class ByCategoryRow(BaseModel):
    model_config = ConfigDict(extra="ignore")

    category: str
    products: int
    units: int
    revenue: float
    margin: Optional[float] = None
    margin_pct: Optional[float] = None

