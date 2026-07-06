import type { Memory } from "./memory";
import type { Risk } from "./project";
import type { Task } from "./task";

export interface SummarizeMemoryInput {
  rawText: string;
  projectId?: string;
  source: string;
}

export interface ExtractedFact {
  id: string;
  text: string;
  confidence: number;
  projectId?: string;
}

export interface MemorySummaryResult {
  summary: string;
  extractedFacts: ExtractedFact[];
  extractedTasks: Task[];
  extractedRisks: Risk[];
  suggestedMemoryItems: Memory[];
}
