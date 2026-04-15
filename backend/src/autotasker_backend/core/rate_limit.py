"""In-memory rate limiter shared across routers.

Uses slowapi, which is a Flask-Limiter port for ASGI apps. The
limiter is keyed by the caller's IP address (``get_remote_address``)
which is enough for Phase 4; per-user limits will replace IP-based
keys when we have a real auth dep in every request.

Limits applied at the route level via decorator:

    @router.post("/stream")
    @limiter.limit("10/minute")
    async def chat_stream(request: Request, ...):
        ...

The ``Request`` parameter is required by slowapi to read the client
IP — do not rename or remove it.
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
