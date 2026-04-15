/**
 * Inngest function definitions for AutoTasker.
 *
 * Each active agent in Supabase corresponds (logically) to a scheduled
 * Inngest function. For Phase 1 we expose a single `executeAgent`
 * handler that fans in via the `agents.execute` event and forwards to
 * the FastAPI backend.
 *
 * Phase 2 will dynamically register one cron function per active agent
 * via Inngest's REST API.
 */

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "autotasker",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

interface ExecuteAgentEvent {
  data: {
    agent_id: string;
  };
}

export const executeAgent = inngest.createFunction(
  { id: "execute-agent", retries: 3 },
  { event: "agents.execute" },
  async ({ event, step }: { event: ExecuteAgentEvent; step: { run: <T>(name: string, fn: () => Promise<T>) => Promise<T> } }) => {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8000";

    return await step.run("dispatch-to-backend", async () => {
      const res = await fetch(`${backend}/inngest/execute`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agent_id: event.data.agent_id,
          run_id: event.data.agent_id,
        }),
      });
      if (!res.ok) {
        throw new Error(`Backend dispatch failed: ${res.status}`);
      }
      return res.json();
    });
  }
);

export const functions = [executeAgent];
