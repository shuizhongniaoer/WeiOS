import { Injectable } from "@nestjs/common";
import type {
  ExtractedFact,
  Memory,
  MemorySummaryResult,
  Risk,
  SummarizeMemoryInput,
  Task,
} from "@weios/shared-types";
import { makeId, nowIso } from "../../common/id";
import { seedMemories } from "../../common/seed";

@Injectable()
export class MemoriesService {
  private readonly memories = [...seedMemories];

  findAll(projectId?: string): Memory[] {
    if (!projectId) {
      return this.memories;
    }

    return this.memories.filter((memory) => memory.projectId === projectId);
  }

  findOne(id: string): Memory | undefined {
    return this.memories.find((memory) => memory.id === id);
  }

  create(memory: Memory): Memory {
    const stamped = {
      ...memory,
      createdAt: memory.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    this.memories.push(stamped);
    return stamped;
  }

  summarize(input: SummarizeMemoryInput): MemorySummaryResult {
    const lines = input.rawText
      .split(/\r?\n|。|；|;/)
      .map((line) => line.trim())
      .filter(Boolean);

    const extractedTasks = lines
      .filter((line) => /(todo|next|action|确认|推进|安排|跟进|需要)/i.test(line))
      .map((line): Task => this.toTask(line, input));

    const extractedRisks = lines
      .filter((line) => /(risk|delay|blocked|延期|风险|阻塞|无法|可能)/i.test(line))
      .map((line): Risk => this.toRisk(line));

    const extractedFacts = lines
      .filter((line) => !extractedTasks.some((task) => task.description === line))
      .slice(0, 8)
      .map((line): ExtractedFact => this.toFact(line, input.projectId));

    const suggestedMemoryItems = [
      this.toMemory(input, lines, extractedTasks.length, extractedRisks.length),
    ];

    return {
      summary: this.makeSummary(lines, extractedTasks.length, extractedRisks.length),
      extractedFacts,
      extractedTasks,
      extractedRisks,
      suggestedMemoryItems,
    };
  }

  private makeSummary(lines: string[], taskCount: number, riskCount: number): string {
    if (lines.length === 0) {
      return "No content was provided.";
    }

    const first = lines.slice(0, 3).join(" ");
    return `${first} Extracted ${taskCount} task(s) and ${riskCount} risk(s).`;
  }

  private toFact(text: string, projectId?: string): ExtractedFact {
    return {
      id: makeId("fact"),
      text,
      confidence: 0.72,
      projectId,
    };
  }

  private toTask(text: string, input: SummarizeMemoryInput): Task {
    const now = nowIso();
    return {
      id: makeId("task"),
      title: text.length > 48 ? `${text.slice(0, 48)}...` : text,
      description: text,
      projectId: input.projectId,
      priority: /(critical|紧急|必须|马上)/i.test(text) ? "critical" : "high",
      status: "todo",
      source: input.source,
      owner: "Wei",
      createdBy: "ai",
      createdAt: now,
      updatedAt: now,
    };
  }

  private toRisk(text: string): Risk {
    return {
      id: makeId("risk"),
      title: text.length > 48 ? `${text.slice(0, 48)}...` : text,
      description: text,
      severity: /(critical|严重|高|延期|blocked|阻塞)/i.test(text)
        ? "high"
        : "medium",
      status: "open",
      owner: "Wei",
      createdAt: nowIso(),
    };
  }

  private toMemory(
    input: SummarizeMemoryInput,
    lines: string[],
    taskCount: number,
    riskCount: number,
  ): Memory {
    const now = nowIso();
    return {
      id: makeId("memory"),
      type: riskCount > 0 ? "project" : "experience",
      title: `Summary from ${input.source}`,
      content: this.makeSummary(lines, taskCount, riskCount),
      source: input.source,
      projectId: input.projectId,
      tags: ["summary", input.source.toLowerCase()],
      confidence: 0.7,
      createdAt: now,
      updatedAt: now,
    };
  }
}
