"""FastAPI application entrypoint.

Run locally with:

    uvicorn autotasker_backend.main:app --reload --port 8000
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from . import __version__
from .api import agents, chat, health, inngest
from .core.config import get_settings
from .core.logging import configure_logging, get_logger
from .core.rate_limit import limiter

# Importing the tools package registers the built-in tools at startup.
from . import tools  # noqa: F401  pylint: disable=unused-import

configure_logging()
log = get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    log.info(
        "app.start",
        environment=settings.environment,
        meta_agent_model=settings.meta_agent_model,
        worker_model=settings.worker_model,
    )
    yield
    log.info("app.stop")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AutoTasker Backend",
        version=__version__,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
        lifespan=lifespan,
    )

    # Rate limiter must be installed before routers are included so
    # decorated routes pick it up.
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(chat.router)
    app.include_router(agents.router)
    app.include_router(inngest.router)
    return app


app = create_app()
