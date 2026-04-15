# AutoTasker Roadmap

## Phase 1 — MVP scaffold (this commit)

- Monorepo layout (`/frontend`, `/backend`, `/infra`, `/docs`).
- Supabase schema with RLS for `users`, `agents`, `execution_logs`.
- Tier-1 LangGraph **Meta-Agent** (`graphs/architect.py`) with
  `intake → feasibility → architect → persist` nodes and a hard
  Feasibility Gate against the Tool Registry.
- Tier-2 LangGraph **Worker** stub (`graphs/worker.py`) with a fixed
  `plan → tool_call → observe → summarize` loop and per-step timeouts.
- Tool Registry + two mock tools (`web_scraper`, `mock_email`) used by
  both the Architect's manifest and the Worker's runtime dispatch.
- FastAPI streaming chat endpoint (`/chat/stream`) and CRUD routes for
  agents/logs.
- Next.js dashboard with **The Forge** (streaming chat + pipeline rail)
  and **My Agents** (table view).

## Phase 2 — Production-readiness

- **Auth**: Supabase auth in the Next.js layer, JWT propagation to
  FastAPI, per-request `RequestContext` dependency.
- **Human-in-the-loop**: `Clarify_Node` using LangGraph `interrupt()`
  with a `Command(resume=...)` flow on the Forge UI.
- **OAuth tools**: Gmail, Google Sheets, Slack, Notion. Each tool
  declares its `requires_oauth=True` and the registry exposes a
  manifest that the Architect uses to ask the user to connect missing
  providers.
- **Inngest dynamic registration**: one scheduled function per active
  agent, wiring the cron in `agents.trigger_cron`.
- **Browserbase / Stagehand**: replace the mock `web_scraper` with a
  real headless-browser tool capable of login flows.
- **Cost / token accounting**: capture `usage_metadata` from each LLM
  call into `execution_logs.tokens_in/out` and `cost_usd`.

## Phase 3 — Self-improving agents

- Failure-aware re-planning loop in the Worker.
- Architect ingests previous execution logs to refine SOPs over time.
- Tool authoring UI (declare a new `ToolSpec` from a JSON schema +
  HTTP endpoint + auth).

## Open questions

- Multi-tenant cost ceilings — per-user vs. per-agent budgets?
- SOP version migration — store migrations alongside the schema?
- Multi-step OAuth flows — encrypted token store schema?
