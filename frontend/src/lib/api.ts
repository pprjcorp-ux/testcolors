/**
 * Thin client over the FastAPI backend. All requests go through the
 * Next.js rewrite at /api/backend/* so the browser never sees the
 * backend origin directly.
 *
 * Every call reads the current Supabase session and attaches the
 * user's access token as a Bearer header. The backend validates it
 * via the `get_current_user_id` FastAPI dependency.
 */

import { getSupabaseBrowser } from "./supabase";
import type { Agent, ExecutionLog, ForgeEvent } from "./types";

const BASE = "/api/backend";

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated — please sign in again.");
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "content-type": "application/json",
      ...authHeaders,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  return (await res.json()) as T;
}

export const api = {
  listAgents(): Promise<Agent[]> {
    return request<Agent[]>(`/agents`);
  },
  getAgent(agentId: string): Promise<Agent> {
    return request<Agent>(`/agents/${agentId}`);
  },
  activateAgent(agentId: string): Promise<Agent> {
    return request<Agent>(`/agents/${agentId}/activate`, { method: "POST" });
  },
  pauseAgent(agentId: string): Promise<Agent> {
    return request<Agent>(`/agents/${agentId}/pause`, { method: "POST" });
  },
  listAgentLogs(agentId: string): Promise<ExecutionLog[]> {
    return request<ExecutionLog[]>(`/agents/${agentId}/logs`);
  },
};

/**
 * Stream the Tier-1 Meta-Agent's reply for a single user message.
 * Yields parsed `ForgeEvent`s as they arrive.
 */
export async function* streamForge(input: {
  threadId?: string;
  message: string;
  signal?: AbortSignal;
}): AsyncGenerator<ForgeEvent, void, void> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${BASE}/chat/stream`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders },
    body: JSON.stringify({
      thread_id: input.threadId,
      message: input.message,
    }),
    signal: input.signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`Forge stream failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are delimited by a blank line.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const block of events) {
      const dataLine = block
        .split("\n")
        .find((l) => l.startsWith("data: "))
        ?.slice(6);
      if (!dataLine) continue;
      if (dataLine === "[DONE]") return;
      try {
        yield JSON.parse(dataLine) as ForgeEvent;
      } catch {
        // ignore malformed frames
      }
    }
  }
}
