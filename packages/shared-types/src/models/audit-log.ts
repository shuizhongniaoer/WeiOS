import type { RiskLevel } from "./permission";

export type AuditActor = "user" | "ai" | "plugin" | "system";
export type AuditStatus = "planned" | "approved" | "blocked" | "executed" | "failed";

export interface AuditLog {
  id: string;
  actor: AuditActor;
  action: string;
  target: string;
  riskLevel: RiskLevel;
  status: AuditStatus;
  approvedBy?: string;
  reason?: string;
  result?: string;
  timestamp: string;
}
