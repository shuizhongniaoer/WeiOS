import type { RiskLevel } from "./permission";

export type WorkflowStepKind =
  | "load_context"
  | "summarize"
  | "classify_risk"
  | "call_agent"
  | "request_approval"
  | "write_memory"
  | "create_task"
  | "audit";

export interface WorkflowStep {
  id: string;
  name: string;
  kind: WorkflowStepKind;
  agentId?: string;
  permissionScope?: string;
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  steps: WorkflowStep[];
  riskLevel: RiskLevel;
  enabled: boolean;
}
