from contextvars import ContextVar
from typing import Optional

_current_user_id: ContextVar[Optional[int]] = ContextVar("current_user_id", default=None)
_current_user_token: ContextVar[Optional[str]] = ContextVar("current_user_token", default=None)


def set_request_identity(user_id: int, user_token: str):
    return _current_user_id.set(user_id), _current_user_token.set(user_token)


def reset_request_identity(tokens) -> None:
    id_token, tok_token = tokens
    _current_user_id.reset(id_token)
    _current_user_token.reset(tok_token)


def get_current_user_id() -> int:
    user_id = _current_user_id.get()
    if user_id is None:
        raise RuntimeError("user_id no establecido en el contexto de la petición")
    return user_id


def get_current_user_token() -> str:
    token = _current_user_token.get()
    if token is None:
        raise RuntimeError("aserción de usuario no establecida en el contexto")
    return token
