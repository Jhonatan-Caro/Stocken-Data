import logging
import httpx

from api.config import Config
from api.models.stats import SummaryRow, ByProductRow, ByMonthRow, ByChannelRow, ByCategoryRow

log = logging.getLogger(__name__)

class StatsUnavailable(RuntimeError):
    """El backend no responde: caído, timeout o 5xx. La tool puede pedir reintento."""

class StatsBadRequest(ValueError):
    """El backend rechazó los parámetros (4xx). Reintentar no sirve."""

_client = httpx.Client(
    base_url=Config.BACKEND_URL,
    headers={"x-service-token": Config.SERVICE_TOKEN},
    timeout=Config.STATS_TIMEOUT,
    transport=httpx.HTTPTransport(retries=2),
)

def _get(path:str, user_id: int, date_from=None, date_to=None) -> list[dict]:
    params = {"userId": user_id, "from": date_from, "to": date_to}
    params = {k: v for k, v in params.items() if v is not None}
    try:
        r = _client.get(path, params=params)
    except httpx.RequestError as exc:
        log.warning("Stats backend inalcanzable: %s", exc)
        raise StatsUnavailable(str(exc)) from exc
    if r.status_code >= 500:
        raise StatsUnavailable(f"HTTP {r.status_code}")
    if r.status_code >= 400:
        raise StatsBadRequest(r.text[:300])
    return r.json()


def sales_by_product(user_id: int, date_from=None, date_to=None) -> list[ByProductRow]:
    raw = _get("/internal/stats/by-product", user_id, date_from, date_to)
    return [ByProductRow(**row) for row in raw]

def sales_by_month(user_id: int, date_from=None, date_to=None) -> list[ByMonthRow]:
    raw = _get("/internal/stats/by-month", user_id, date_from, date_to)
    return [ByMonthRow(**row) for row in raw]

def sales_by_channel(user_id: int, date_from=None, date_to=None) -> list[ByChannelRow]:
    raw = _get("/internal/stats/by-channel", user_id, date_from, date_to)
    return [ByChannelRow(**row) for row in raw]

def sales_by_category(user_id: int, date_from=None, date_to=None) -> list[ByCategoryRow]:
    raw = _get("/internal/stats/by-category", user_id, date_from, date_to)
    return [ByCategoryRow(**row) for row in raw]

def sales_summary(user_id: int, date_from=None, date_to=None) -> SummaryRow:
    raw = _get("/internal/stats/summary", user_id, date_from, date_to)
    return SummaryRow(**raw)