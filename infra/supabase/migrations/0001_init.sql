-- =====================================================================
-- AutoTasker — Initial Schema
-- Migration: 0001_init.sql
-- =====================================================================
--
-- Tables:
--   * users           — Mirror of auth.users with profile metadata
--   * agents          — Worker Agent definitions (SOPs, triggers, status)
--   * execution_logs  — Per-run logs for background worker executions
--
-- All non-system tables are protected by Row Level Security (RLS) so
-- that callers using the Supabase anon key can only read/write their
-- own rows. Service-role access bypasses RLS for backend workers.
-- =====================================================================

-- Required extensions ------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- search on agent names

-- Custom enums -------------------------------------------------------------
do $$ begin
  create type agent_status as enum ('draft', 'active', 'paused', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type execution_status as enum ('pending', 'running', 'success', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- users
-- =====================================================================
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.users is
  'Profile mirror of auth.users. Populated by a trigger on auth.users insert.';

-- Auto-populate users on new auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- agents
-- =====================================================================
-- An "agent" is the persisted Standard Operating Procedure (SOP)
-- produced by the Tier-1 Meta-Agent. It contains everything the Tier-2
-- Worker needs to compile a LangGraph instance at run time.
-- =====================================================================
create table if not exists public.agents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,

  name            text not null,
  description     text,

  -- The full SOP JSON emitted by the Architect node. Schema documented
  -- in backend/src/autotasker_backend/schemas/sop.py.
  sop             jsonb not null,

  -- Flat list of tool ids referenced by the SOP (denormalised for fast
  -- filtering / capability dashboards).
  required_tools  text[] not null default '{}',

  -- Cron expression that drives Inngest scheduling. Null = manual only.
  trigger_cron    text,

  -- Hard ceilings enforced when compiling the worker graph.
  recursion_limit  integer not null default 25 check (recursion_limit between 1 and 200),
  step_timeout_ms  integer not null default 30000 check (step_timeout_ms between 1000 and 600000),

  status          agent_status not null default 'draft',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_run_at     timestamptz,

  constraint agents_name_not_blank check (length(trim(name)) > 0)
);

create index if not exists agents_user_id_idx       on public.agents(user_id);
create index if not exists agents_status_idx        on public.agents(status);
create index if not exists agents_name_trgm_idx     on public.agents using gin (name gin_trgm_ops);
create index if not exists agents_required_tools_idx on public.agents using gin (required_tools);

comment on column public.agents.sop is
  'Strict JSON SOP produced by the Meta-Agent. See SOP Pydantic schema.';

-- =====================================================================
-- execution_logs
-- =====================================================================
create table if not exists public.execution_logs (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references public.agents(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,

  status        execution_status not null default 'pending',

  -- The Inngest run id (or any orchestrator id) for cross-system tracing.
  run_id        text,

  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  duration_ms   integer generated always as (
                  case
                    when finished_at is null then null
                    else (extract(epoch from (finished_at - started_at)) * 1000)::int
                  end
                ) stored,

  -- Final summary returned by the worker graph's Summarize node.
  output        jsonb,

  -- Error message if the run failed (truncated to 4kb at write time).
  error_message text,

  -- Token / cost accounting.
  tokens_in     integer not null default 0,
  tokens_out    integer not null default 0,
  cost_usd      numeric(10, 6) not null default 0
);

create index if not exists execution_logs_agent_id_idx
  on public.execution_logs(agent_id, started_at desc);
create index if not exists execution_logs_user_id_idx
  on public.execution_logs(user_id, started_at desc);
create index if not exists execution_logs_status_idx
  on public.execution_logs(status);

-- Bump agents.last_run_at whenever a log row finishes.
create or replace function public.touch_agent_last_run()
returns trigger
language plpgsql
as $$
begin
  if new.finished_at is not null
     and (old.finished_at is null or old.finished_at <> new.finished_at) then
    update public.agents
      set last_run_at = new.finished_at
      where id = new.agent_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_execution_log_finished on public.execution_logs;
create trigger on_execution_log_finished
  after update on public.execution_logs
  for each row execute function public.touch_agent_last_run();

-- =====================================================================
-- updated_at maintenance
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists agents_touch_updated_at on public.agents;
create trigger agents_touch_updated_at
  before update on public.agents
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.users          enable row level security;
alter table public.agents         enable row level security;
alter table public.execution_logs enable row level security;

-- users -------------------------------------------------------------------
drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
  for select using (auth.uid() = id);

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (auth.uid() = id);

-- agents ------------------------------------------------------------------
drop policy if exists agents_select_own on public.agents;
create policy agents_select_own on public.agents
  for select using (auth.uid() = user_id);

drop policy if exists agents_insert_own on public.agents;
create policy agents_insert_own on public.agents
  for insert with check (auth.uid() = user_id);

drop policy if exists agents_update_own on public.agents;
create policy agents_update_own on public.agents
  for update using (auth.uid() = user_id);

drop policy if exists agents_delete_own on public.agents;
create policy agents_delete_own on public.agents
  for delete using (auth.uid() = user_id);

-- execution_logs ----------------------------------------------------------
-- Users may read their own logs but cannot write them — only the backend
-- service role inserts/updates here.
drop policy if exists logs_select_own on public.execution_logs;
create policy logs_select_own on public.execution_logs
  for select using (auth.uid() = user_id);
