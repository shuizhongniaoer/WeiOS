import type { Memory } from "./memory";
import type { Task } from "./task";

export type ProjectStatus = "active" | "paused" | "blocked" | "done" | "idea";

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "monitoring" | "resolved";
  owner?: string;
  createdAt: string;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  defaultBranch?: string;
}

export interface ProjectDocument {
  id: string;
  title: string;
  pathOrUrl: string;
  kind: "doc" | "repo" | "asset" | "note" | "other";
}

export interface Person {
  id: string;
  name: string;
  relationship?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: number;
  goals: string[];
  currentState: string;
  nextActions: Task[];
  risks: Risk[];
  documents: ProjectDocument[];
  relatedMemories: Memory[];
  relatedPeople: Person[];
  repositories: Repository[];
  updatedAt: string;
}
