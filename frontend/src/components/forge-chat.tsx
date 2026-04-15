"use client";

/**
 * The Forge — streaming chat UI for the Tier-1 Meta-Agent.
 *
 * The component owns its own conversation state (no global store) and
 * pushes each message to /api/backend/chat/stream via `streamForge`.
 * Incoming SSE events are translated into either chat bubbles or a
 * compact "pipeline" rail that shows which graph node is currently
 * running.
 */

import { useCallback, useRef, useState } from "react";
import { ArrowUp, CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { streamForge } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ForgeEvent } from "@/lib/types";

interface ChatBubble {
  id: string;
  role: "user" | "assistant";
  content: string;
  node?: string;
}

interface PipelineEvent {
  node: string;
  status?: string;
  ok: boolean;
  detail?: string;
}

// Maximum chat history kept in state. Older bubbles are pruned from
// the front so a long-running conversation can't accumulate unbounded
// memory on low-powered clients.
const MAX_MESSAGES = 200;

function appendBounded<T>(list: T[], next: T): T[] {
  const combined = [...list, next];
  return combined.length > MAX_MESSAGES
    ? combined.slice(combined.length - MAX_MESSAGES)
    : combined;
}

export function ForgeChat() {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [pipeline, setPipeline] = useState<PipelineEvent[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userBubble: ChatBubble = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => appendBounded(m, userBubble));
    setInput("");
    setBusy(true);
    setPipeline([]);

    abortRef.current = new AbortController();

    try {
      for await (const event of streamForge({
        threadId,
        message: text,
        signal: abortRef.current.signal,
      })) {
        applyEvent(event);
      }
    } catch (err) {
      setMessages((m) =>
        appendBounded(m, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Stream error: ${err instanceof Error ? err.message : String(err)}`,
        })
      );
    } finally {
      setBusy(false);
      abortRef.current = null;
    }

    function applyEvent(event: ForgeEvent) {
      switch (event.type) {
        case "start":
          setThreadId(event.thread_id);
          return;
        case "node": {
          const ok = !event.error;
          const detail =
            event.feasibility?.reason ??
            (event.sop_name ? `${event.sop_name} (${event.sop_step_count} steps)` : undefined) ??
            event.error ??
            event.status;
          setPipeline((p) => appendBounded(p, { node: event.node, status: event.status, ok, detail }));
          return;
        }
        case "message":
          setMessages((m) =>
            appendBounded(m, {
              id: crypto.randomUUID(),
              role: "assistant",
              content: event.content,
              node: event.node,
            })
          );
          return;
        case "error":
          setMessages((m) =>
            appendBounded(m, {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Backend error: ${event.error}`,
            })
          );
          return;
      }
    }
  }, [busy, input, threadId]);

  return (
    <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden p-8 lg:grid-cols-[1fr_320px]">
      {/* Conversation */}
      <Card className="flex flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <EmptyState />
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} bubble={m} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Architect is thinking…
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Describe a repetitive task you want automated…"
              className="min-h-[60px] resize-none"
              disabled={busy}
            />
            <Button
              onClick={() => void handleSend()}
              disabled={busy || !input.trim()}
              size="icon"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Pipeline rail */}
      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold">Architect Pipeline</h2>
          <p className="text-xs text-muted-foreground">
            Live graph node trace
          </p>
        </div>
        <div className="space-y-2 p-4">
          {pipeline.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Send a message to see the pipeline.
            </p>
          )}
          {pipeline.map((p, i) => (
            <PipelineRow key={i} event={p} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md py-12 text-center text-sm text-muted-foreground">
      <p className="mb-3 font-medium text-foreground">Try one of these:</p>
      <ul className="space-y-2">
        <li>· Every weekday at 9am, scrape the Hacker News front page and email me the top 5.</li>
        <li>· Once a day, fetch a public RSS feed and notify me of new entries.</li>
        <li>· Hourly, check a status page and ping me if it's degraded.</li>
      </ul>
    </div>
  );
}

function MessageBubble({ bubble }: { bubble: ChatBubble }) {
  const isUser = bubble.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {bubble.node && (
          <div className="mb-1 text-[10px] uppercase tracking-wide opacity-60">
            {bubble.node}
          </div>
        )}
        <div className="whitespace-pre-wrap">{bubble.content}</div>
      </div>
    </div>
  );
}

function PipelineRow({ event }: { event: PipelineEvent }) {
  const Icon = event.ok ? CheckCircle2 : event.node === "reject" ? ShieldAlert : XCircle;
  const variant = event.ok ? "success" : "warning";
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Icon
            className={cn(
              "h-3.5 w-3.5",
              event.ok ? "text-emerald-500" : "text-amber-500"
            )}
          />
          {event.node}
        </div>
        {event.status && <Badge variant={variant}>{event.status}</Badge>}
      </div>
      {event.detail && (
        <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
      )}
    </div>
  );
}
