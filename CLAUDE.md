# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**AutoTasker** is a two-tier agentic SaaS monorepo. Users describe repetitive tasks in chat; a synchronous **Meta-Agent** (Tier 1) checks feasibility against a strict Tool Registry, designs an SOP, and persists it as a draft Worker. A scheduled **Worker Agent** (Tier 2) is then compiled per execution from that SOP and runs autonomously via Inngest.

Status: **Phase 1 MVP scaffold**. The Tier-1 graph is fully wired; the Tier-2 worker is a deterministic step-loop stub. Auth, OAuth tools, Inngest dynamic registration, and Browserbase are tracked in `docs/ROADMAP.md`.

## Repo layout

```
frontend/   Next.js 15 App Router dashboard (The Forge + My Agents)
backend/    Python 3.12 FastAPI + LangGraph package (autotasker_backend)
infra/      Supabase SQL migrations, Inngest function stubs
docs/       Roadmap and design notes
```

## Common commands

### Backend (Python 3.12+)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env                                 # fill in real secrets

uvicorn autotasker_backend.main:app --reload --port 8000

pytest                                               # all tests
pytest tests/test_sop_schema.py                      # single file
pytest tests/test_sop_schema.py::test_sop_round_trip # single test
ruff check src tests
mypy src
```

OpenAPI docs at <http://localhost:8000/docs> when running.

### Frontend (Node 20+)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev          # Next.js dev server on :3000
npm run build
npm run lint
npm run typecheck    # tsc --noEmit
```

The frontend talks to FastAPI **only** through the Next.js rewrite at `/api/backend/*` (configured in `frontend/next.config.ts`). The browser never sees the backend origin directly. `BACKEND_URL` env var controls the rewrite target.

### Database

Apply migrations via the Supabase SQL editor or CLI:

```bash
supabase db push   # picks up infra/supabase/migrations/0001_init.sql
```

## Architecture — the parts that span multiple files

### Two-tier agent topology

The whole product is built around **two completely separate LangGraph `StateGraph` instances** that share *only* the SOP JSON document persisted in Supabase. They have distinct state schemas, distinct execution contexts, and live in different routers.

**Tier 1 — Meta-Agent (`backend/src/autotasker_backend/graphs/architect.py`)**

```
intake → feasibility → [reject | architect → persist] → END
```

- Runs synchronously inside a FastAPI request.
- State: `ArchitectState` (`graphs/state.py`) — TypedDict with an `add_messages` reducer on `messages`.
- The **Feasibility Gate** is a *deterministic-then-LLM* design: `feasibility_node` builds its system prompt from `REGISTRY.manifest()` (the **single source of truth** for platform capabilities), the LLM emits a `FeasibilityReport` via `with_structured_output(...)`, and any hallucinated tool ids are stripped before the conditional edge runs. Always preserve this filter when modifying the node.
- The **Architect** node uses `with_structured_output(SOP)` so an invalid SOP raises *before* `persist_node` ever touches Supabase. This guarantee is load-bearing — do not weaken it.
- Streamed to the frontend via `graph.astream(stream_mode="updates")` in `api/chat.py`.

**Tier 2 — Worker (`backend/src/autotasker_backend/graphs/worker.py`)**

```
plan → tool_call → observe → (loop ≤ recursion_limit) → summarize → END
```

- Compiled **per execution** from a stored SOP via `build_worker_graph(sop)`. The compiled graph carries the SOP's `recursion_limit` via `.with_config({"recursion_limit": ...})`.
- Honours `SOP.step_timeout_ms` via `asyncio.wait_for` per step.
- Tool dispatch goes through the same `REGISTRY` the Meta-Agent uses for its manifest — there is one Tool Registry, both tiers consume it.
- Invoked from `api/inngest.py` (`POST /inngest/execute`), which writes a row to `execution_logs` before and after the run.

### The SOP contract (`schemas/sop.py`)

The `SOP` Pydantic model is the **only** thing the two tiers share. It is:

- Versioned (`schema_version: Literal["1.0"]`).
- Strict (`extra="forbid"`) — unknown keys are rejected so the Worker never encounters undocumented fields.
- Self-validating: duplicate step ids, malformed cron expressions, and out-of-range execution ceilings all raise at construction time.
- Persisted to `agents.sop` (jsonb) and indexed by `agents.required_tools` (text[]) for capability filtering.

When evolving the SOP shape, bump `schema_version` and add a migration path — the worker reads SOPs that may have been written months earlier.

### Tool Registry (`tools/registry.py`)

A single module-level `REGISTRY = ToolRegistry()` singleton. Tools self-register at import time by calling `REGISTRY.register(ToolSpec(...))` at module scope. The registry is loaded into the FastAPI app via `from . import tools` in `main.py`, which triggers `tools/__init__.py` to import each tool module.

**To add a new tool:**

1. Create `backend/src/autotasker_backend/tools/<your_tool>.py`.
2. Define a Pydantic `*Input` schema and an `async def _handler(raw_inputs: dict) -> dict`.
3. Call `REGISTRY.register(ToolSpec(...))` at module scope.
4. Re-export it from `tools/__init__.py` so the import side-effect runs at startup.

No further wiring is required — the Meta-Agent's manifest is regenerated from the registry on every chat request, and the Worker looks up handlers by `tool_id`.

### Strict separation of concerns (FastAPI routers)

- `api/chat.py` — synchronous chat streaming (Tier 1). Compiles `_ARCHITECT_GRAPH` once at import.
- `api/agents.py` — CRUD over saved agents (used by the My Agents UI).
- `api/inngest.py` — async worker dispatch (Tier 2). Loads agent → compiles worker graph → records start/finish in `execution_logs`.
- `api/health.py` — liveness / readiness.

These four routers must stay independent. Do not import chat code from inngest or vice versa.

### LLM provider abstraction (`llm/provider.py`)

Both tiers go through `get_meta_agent_llm()` / `get_worker_llm()`. Selection by model id prefix: `claude-*` → `ChatAnthropic`, anything else → `ChatOpenAI`. To swap providers, change the `META_AGENT_MODEL` / `WORKER_MODEL` env vars — no code changes.

Default models: `claude-opus-4-6` (Meta-Agent) and `claude-haiku-4-5-20251001` (Worker). The legacy SKUs in the original spec (`claude-3.7-sonnet`, `claude-3.5-haiku`, `o3-mini`, `gpt-4o-mini`) are intentionally not the defaults.

### Database & RLS (`infra/supabase/migrations/0001_init.sql`)

Three tables: `users` (mirror of `auth.users`), `agents` (SOPs + triggers + status), `execution_logs` (per-run output, errors, token/cost accounting with a generated `duration_ms`).

- `users` is auto-populated on signup by the `on_auth_user_created` trigger.
- `execution_logs.finished_at` updates bump `agents.last_run_at` via `on_execution_log_finished`.
- All three tables have RLS scoped to `auth.uid()`. Backend writes use the **service-role** key (RLS bypassed) via `db/client.py::get_supabase_admin`. The browser must never see the service-role key.
- `execution_logs` has no insert/update RLS policy — only the service role writes there.

### Frontend ↔ backend wiring

- `frontend/src/lib/types.ts` is **hand-written** to mirror the Pydantic schemas in `backend/src/autotasker_backend/schemas/`. Phase 2 will generate this from the FastAPI OpenAPI schema. Until then, keep them in sync manually whenever a schema changes.
- `frontend/src/lib/api.ts::streamForge()` is an async generator that parses SSE frames into `ForgeEvent`s. The event shapes are union-typed in `types.ts` and produced in `backend/src/autotasker_backend/api/chat.py::_stream_architect`. **These two files must stay in sync.**
- `forge-chat.tsx` consumes the SSE stream and renders both a chat bubble list and a "pipeline rail" showing each graph node as it executes.

## Conventions worth preserving

- **Modern LangGraph only** — `StateGraph`, `add_messages`, `with_structured_output`, `astream(stream_mode=...)`. Do not introduce deprecated LangChain `Chain`/`LLMChain` constructs.
- **Pydantic v2 strict** — every cross-boundary model uses `ConfigDict(extra="forbid")`. Do not loosen this.
- **Fail fast on config** — `core/config.py::Settings` validates required env vars at process start, not at first use. The `require_*` helper methods raise with actionable messages.
- **Repository pattern over Supabase** — LangGraph nodes never import the Supabase SDK directly. They go through `db/repositories.py`.
- **TypeScript strict mode** — `tsconfig.json` has `strict: true` and `experimental.typedRoutes: true`. Route props must use `Route` from `next`.

## Branch policy (per session instructions)

Development on this branch happens on `claude/autotasker-mvp-init-HBIsc`. Push there with `git push -u origin claude/autotasker-mvp-init-HBIsc`. Do not push to `main` and do not open PRs unless explicitly asked.
