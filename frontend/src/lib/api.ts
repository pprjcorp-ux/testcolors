/**
 * Thin client over the FastAPI backend. All requests go through the
 * Next.js rewrite at /api/backend/* so the browser never sees the
 * backend origin directly.
 */

import type { Agent, ExecutionLog, ForgeEvent } from "./types";

const BASE = "/api/backend";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
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
  listAgents(userId: string): Promise<Agent[]> {
    return request<Agent[]>(`/agents?user_id=${encodeURIComponent(userId)}`);
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
  userId: string;
  threadId?: string;
  message: string;
  signal?: AbortSignal;
}): AsyncGenerator<ForgeEvent, void, void> {
  const res = await fetch(`${BASE}/chat/stream`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: input.userId,
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
