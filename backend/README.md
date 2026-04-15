# AutoTasker Backend

FastAPI + LangGraph backend for AutoTasker. Implements the Tier-1
Meta-Agent (synchronous chat) and the Tier-2 Worker dispatch path
(invoked by Inngest).

## Layout

```
src/autotasker_backend/
├── api/         FastAPI routers (chat, agents, inngest, health)
├── graphs/      LangGraph definitions (architect, worker, state)
├── tools/       Tool registry + WebScraperTool + MockEmailTool
├── llm/         Provider-agnostic chat-model factory
├── db/          Supabase repositories
├── schemas/     Pydantic schemas (SOP, Agent, Log)
├── core/        Config + structured logging
└── main.py      FastAPI app factory
```

## Running locally

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env       # fill in secrets
uvicorn autotasker_backend.main:app --reload --port 8000
```

OpenAPI docs at <http://localhost:8000/docs>.

## Tests

```bash
pytest
```

## Adding a new tool

1. Create `src/autotasker_backend/tools/<your_tool>.py`.
2. Define a Pydantic input schema and an `async def _handler(...)`.
3. Register with `REGISTRY.register(ToolSpec(...))` at module scope.
4. Import the new module from `tools/__init__.py` so it loads at
   startup.

The Architect node's manifest is regenerated from the registry on each
request, so no further wiring is required.
