"use client";

/**
 * My Agents — table view of the user's saved Worker Agents.
 *
 * Lists all agents for the authenticated user, shows the latest
 * execution log per agent, and exposes Activate / Pause buttons.
 *
 * Data is loaded from /api/backend/agents (proxied to FastAPI). For
 * Phase 1 we use a hard-coded demo user id; the Supabase auth wiring
 * happens in Phase 2.
 */

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pause, Play, RefreshCw } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import type { Agent, AgentStatus, ExecutionLog } from "@/lib/types";

const STATUS_VARIANT: Record<AgentStatus, BadgeProps["variant"]> = {
  draft: "secondary",
  active: "success",
  paused: "warning",
  archived: "outline",
};

interface Row {
  agent: Agent;
  latest: ExecutionLog | null;
}

export function AgentsTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const agents = await api.listAgents();
      const enriched: Row[] = await Promise.all(
        agents.map(async (agent) => {
          try {
            const logs = await api.listAgentLogs(agent.id);
            return { agent, latest: logs[0] ?? null };
          } catch {
            return { agent, latest: null };
          }
        })
      );
      setRows(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleStatus = useCallback(
    async (agent: Agent) => {
      setBusyId(agent.id);
      try {
        const next =
          agent.status === "active"
            ? await api.pauseAgent(agent.id)
            : await api.activateAgent(agent.id);
        setRows((prev) =>
          prev.map((r) => (r.agent.id === next.id ? { ...r, agent: next } : r))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusyId(null);
      }
    },
    []
  );

  return (
    <Card>
      <div className="flex items-center justify-between border-b p-4">
        <p className="text-sm text-muted-foreground">
          {rows.length} agent{rows.length === 1 ? "" : "s"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw
            className={loading ? "h-3 w-3 animate-spin" : "h-3 w-3"}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="border-b bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tools</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Last run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                No agents yet. Head to The Forge to create one.
              </TableCell>
            </TableRow>
          ) : (
            rows.map(({ agent, latest }) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div className="font-medium">{agent.name}</div>
                  {agent.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {agent.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[agent.status]}>
                    {agent.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.required_tools.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {agent.trigger_cron ? (
                    <code className="text-xs">{agent.trigger_cron}</code>
                  ) : (
                    <span className="text-xs text-muted-foreground">manual</span>
                  )}
                </TableCell>
                <TableCell>
                  {latest ? (
                    <div className="flex flex-col">
                      <Badge
                        variant={
                          latest.status === "success"
                            ? "success"
                            : latest.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {latest.status}
                      </Badge>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(latest.started_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">never</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={agent.status === "active" ? "outline" : "default"}
                    disabled={busyId === agent.id}
                    onClick={() => void toggleStatus(agent)}
                  >
                    {agent.status === "active" ? (
                      <>
                        <Pause className="h-3 w-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" /> Activate
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
