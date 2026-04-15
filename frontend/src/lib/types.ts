/**
 * Shared TypeScript types — kept hand-written and aligned with the
 * Pydantic schemas in backend/src/autotasker_backend/schemas/.
 *
 * For Phase 2 we'll generate these from the FastAPI OpenAPI schema.
 */

export type AgentStatus = "draft" | "active" | "paused" | "archived";

export type ExecutionStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "cancelled";

export interface SOPStep {
  id: string;
  description: string;
  tool_id: string | null;
  inputs: Record<string, unknown>;
  success_criteria: string | null;
}

export interface ToolBinding {
  tool_id: string;
  config: Record<string, unknown>;
  requires_oauth: boolean;
  oauth_provider: string | null;
}

export interface TriggerSpec {
  type: "cron" | "manual" | "webhook";
  cron: string | null;
  timezone: string;
}

export interface SOP {
  schema_version: "1.0";
  name: string;
  goal: string;
  tools: ToolBinding[];
  steps: SOPStep[];
  trigger: TriggerSpec;
  recursion_limit: number;
  step_timeout_ms: number;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sop: SOP;
  required_tools: string[];
  trigger_cron: string | null;
  recursion_limit: number;
  step_timeout_ms: number;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
  last_run_at: string | null;
}

export interface ExecutionLog {
  id: string;
  agent_id: string;
  user_id: string;
  status: ExecutionStatus;
  run_id: string | null;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  output: Record<string, unknown> | null;
  error_message: string | null;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
}

/** SSE event shapes streamed from the backend chat endpoint. */
export type ForgeEvent =
  | { type: "start"; thread_id: string }
  | {
      type: "node";
      node: string;
      status?: string;
      feasibility?: {
        feasible: boolean;
        reason: string;
        matched_tool_ids: string[];
        missing_capabilities: string[];
      };
      sop_name?: string;
      sop_step_count?: number;
      agent_id?: string;
      error?: string;
    }
  | {
      type: "message";
      node: string;
      role: "assistant";
      content: string;
    }
  | { type: "error"; error: string };
