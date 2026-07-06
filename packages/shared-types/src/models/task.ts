export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "doing" | "blocked" | "done";
export type TaskCreator = "user" | "ai" | "integration";

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  source: string;
  owner: string;
  createdBy: TaskCreator;
  createdAt: string;
  updatedAt: string;
}
