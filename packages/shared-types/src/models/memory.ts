export type MemoryType =
  | "long_term"
  | "project"
  | "decision"
  | "people"
  | "finance"
  | "health"
  | "prompt"
  | "experience";

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  source: string;
  projectId?: string;
  peopleIds?: string[];
  tags: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
}
