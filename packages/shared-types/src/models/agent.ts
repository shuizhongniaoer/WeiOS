export type AgentProvider = "openai" | "anthropic" | "google" | "local";

export type AgentRole =
  | "planner"
  | "architect"
  | "coder"
  | "reviewer"
  | "researcher"
  | "writer"
  | "finance_analyst"
  | "automation_executor";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  provider: AgentProvider;
  model: string;
  permissions: string[];
  enabled: boolean;
  lastRunAt?: string;
}
