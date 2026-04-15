"""Liveness / readiness endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from .. import __version__

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok", "version": __version__}


@router.get("/readyz")
async def readyz() -> dict[str, str]:
    # In production this would verify Supabase + LLM + Inngest connectivity.
    return {"status": "ready"}
