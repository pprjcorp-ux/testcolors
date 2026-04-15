# AutoTasker

> Zero-friction natural-language Agentic SaaS. Describe a repetitive task in chat — a Meta-Agent designs a strict SOP, deploys a background Worker Agent, and runs it on a schedule.

## Architecture (Two-Tier Agent System)

```
┌─────────────────────────────────────────────────────────────────┐
│                        TIER 1 — META-AGENT                      │
│                          (Synchronous)                          │
│                                                                 │
│   User chat ──► Intake ──► Feasibility Gate ──► Clarify ──►     │
│                              │                                  │
│                              └─► Reject (END) if not feasible   │
│                                                                 │
│   ──► Architect (emit SOP JSON) ──► Persist (Supabase)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼  agents row (sop, trigger_cron)
┌─────────────────────────────────────────────────────────────────┐
│                       TIER 2 — WORKER AGENT                     │
│                  (Asynchronous, Inngest-driven)                 │
│                                                                 │
│   Inngest cron ──► Compile graph from SOP ──► Plan ──►          │
│                                                                 │
│   ──► ToolCall ──► Observe ──► (loop ≤ recursion_limit) ──►     │
│                                                                 │
│   ──► Summarize ──► LogResult (execution_logs)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer              | Technology                                            |
|--------------------|-------------------------------------------------------|
| Frontend           | Next.js 15 (App Router), React 19, TypeScript 5      |
| Styling            | TailwindCSS 4, Shadcn UI                             |
| Backend            | Python 3.12, FastAPI, Pydantic v2                    |
| Agent Framework    | LangGraph (modern `StateGraph` API)                  |
| Async Execution    | Inngest                                              |
| Database / Auth    | Supabase (PostgreSQL + Row-Level Security)           |
| Meta-Agent Model   | `claude-opus-4-6` (fallback `o3-mini`)               |
| Worker Model       | `claude-haiku-4-5-20251001` (fallback `gpt-4o-mini`) |
| Web Automation     | Browserbase / Stagehand                              |

## Repository Layout

```
.
├── frontend/            Next.js dashboard (The Forge + My Agents)
│   ├── src/app/         App Router pages & API routes
│   ├── src/components/  React components (Shadcn UI)
│   └── src/lib/         Supabase client, utils
├── backend/             FastAPI + LangGraph
│   └── src/autotasker_backend/
│       ├── api/         FastAPI routers (chat, agents, inngest, health)
│       ├── graphs/      LangGraph definitions (architect, worker, state)
│       ├── tools/       Tool registry & implementations
│       ├── llm/         Provider abstraction (Anthropic / OpenAI)
│       ├── db/          Supabase repositories
│       ├── schemas/     Pydantic schemas (SOP, Agent, Log)
│       └── core/        Config, logging
├── infra/
│   ├── supabase/        SQL migrations
│   └── inngest/         Inngest function definitions
└── docs/
```

## Quickstart

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env       # fill in secrets
uvicorn autotasker_backend.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 3. Database

Apply the SQL migration in `infra/supabase/migrations/0001_init.sql` via the
Supabase SQL editor or CLI:

```bash
supabase db push
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.local.example` for the full list.
At minimum you need:

- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- (optional) `BROWSERBASE_API_KEY`, `OPENAI_API_KEY`

## Status

**Phase 1 MVP** — scaffolding, Tier 1 Meta-Agent, mock tools, dashboard shell.
Tier 2 worker compilation, Inngest cron wiring, OAuth flows, and Browserbase
integration are tracked in `docs/ROADMAP.md`.
