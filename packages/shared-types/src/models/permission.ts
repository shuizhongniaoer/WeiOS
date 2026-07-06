export type RiskLevel = "green" | "yellow" | "red";

export type PermissionScope =
  | "project.read"
  | "project.write"
  | "memory.read"
  | "memory.write"
  | "task.read"
  | "task.write"
  | "agent.run"
  | "external.read"
  | "external.write"
  | "finance.read"
  | "finance.trade"
  | "system.deploy"
  | "file.delete";

export interface Permission {
  id: string;
  scope: PermissionScope;
  riskLevel: RiskLevel;
  description: string;
  requiresApproval: boolean;
  enabled: boolean;
}

export interface PendingApproval {
  id: string;
  action: string;
  target: string;
  riskLevel: RiskLevel;
  requestedBy: "ai" | "plugin" | "system";
  reason: string;
  createdAt: string;
}
