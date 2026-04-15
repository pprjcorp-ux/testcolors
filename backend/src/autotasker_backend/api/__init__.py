"""FastAPI routers.

Strict separation of concerns:

* :mod:`chat`    — synchronous chat streaming for The Forge UI
* :mod:`agents`  — CRUD over saved agents (Meta-Agent output)
* :mod:`inngest` — webhook receiver for background worker dispatch
* :mod:`health`  — liveness / readiness
"""
