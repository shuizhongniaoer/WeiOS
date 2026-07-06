"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  Agent,
  MemorySummaryResult,
  Project,
  Risk,
  Task,
} from "@weios/shared-types";

type ActiveView =
  | "Dashboard"
  | "Projects"
  | "Memories"
  | "Tasks"
  | "AI Team"
  | "Permissions"
  | "Settings";

type ProjectSummary = Pick<
  Project,
  "id" | "name" | "status" | "priority" | "goals" | "currentState"
>;

type ProjectProblem = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
};

type ProjectResource = {
  id: string;
  title: string;
  kind: "doc" | "repo" | "dashboard" | "folder" | "note";
  location: string;
  owner: string;
};

type PermissionRiskLevel = "green" | "yellow" | "red";
type PermissionPolicy = "allow" | "confirm" | "deny";
type AuditLogResult = "allowed" | "queued" | "approved" | "blocked";

type PermissionRule = {
  id: string;
  action: string;
  description: string;
  target: string;
  riskLevel: PermissionRiskLevel;
  defaultPolicy: PermissionPolicy;
};

type AuditLogEntry = {
  id: string;
  actor: "AI" | "Wei";
  action: string;
  target: string;
  riskLevel: PermissionRiskLevel;
  result: AuditLogResult;
  detail: string;
  createdAt: string;
};

type ProjectAiAction = {
  id: string;
  title: string;
  description: string;
  riskLevel: PermissionRiskLevel;
};

type AiActionKind =
  | "summarize_project"
  | "generate_next_actions"
  | "extract_risks"
  | "create_codex_prompt";

type AiActionDefinition = {
  kind: AiActionKind;
  title: string;
  description: string;
  riskLevel: PermissionRiskLevel;
  permissionAction: string;
};

type GeneratedAiOutput = {
  id: string;
  action: AiActionKind;
  title: string;
  content: string;
  projectId: string;
  projectName: string;
  riskLevel: PermissionRiskLevel;
  memoryType: MemoryKind;
  taskTitle: string;
  taskDescription: string;
  createdAt: string;
};

type TaskSourceType = "manual" | "memory" | "ai_output" | "import";
type TaskProjectFilter = "All" | string;
type TaskPriorityFilter = "All" | Task["priority"];

type TaskRecord = Task & {
  sourceType: TaskSourceType;
  sourceId?: string;
  aiAssistable: boolean;
  requiresApproval: boolean;
};

type TaskFormDraft = {
  title: string;
  description: string;
  projectId: string;
  priority: Task["priority"];
  sourceType: TaskSourceType;
  aiAssistable: boolean;
  requiresApproval: boolean;
};

type MemoryKind = "Decision" | "Fact" | "Risk" | "Lesson" | "Idea";
type MemoryTypeFilter = "All" | MemoryKind;

type MemoryRecord = {
  id: string;
  type: MemoryKind;
  title: string;
  content: string;
  projectId: string;
  tags: string[];
  source: string;
  createdAt: string;
};

type MemoryFormDraft = {
  type: MemoryKind;
  title: string;
  content: string;
  projectId: string;
  tags: string;
  source: string;
};

type ProjectHubDetails = {
  overview: string;
  currentProblems: ProjectProblem[];
  risks: Risk[];
  nextActions: Task[];
  relatedMemories: MemoryRecord[];
  resources: ProjectResource[];
  aiActions: ProjectAiAction[];
};

type ProjectHubRecord = ProjectSummary & ProjectHubDetails;

const memoryTypes: MemoryKind[] = ["Decision", "Fact", "Risk", "Lesson", "Idea"];
const memoryTypeFilters: MemoryTypeFilter[] = ["All", ...memoryTypes];
const taskStatuses: Task["status"][] = ["todo", "doing", "blocked", "done"];
const taskPriorityFilters: TaskPriorityFilter[] = [
  "All",
  "critical",
  "high",
  "medium",
  "low",
];
const aiActionDefinitions: AiActionDefinition[] = [
  {
    kind: "summarize_project",
    title: "Summarize Project",
    description: "Create a concise project brief from the current hub state.",
    riskLevel: "green",
    permissionAction: "AI can summarize project",
  },
  {
    kind: "generate_next_actions",
    title: "Generate Next Actions",
    description: "Suggest focused follow-up tasks for the selected project.",
    riskLevel: "green",
    permissionAction: "AI can create task draft",
  },
  {
    kind: "extract_risks",
    title: "Extract Risks",
    description: "Turn problems, context, and memories into risk notes.",
    riskLevel: "green",
    permissionAction: "AI can summarize project",
  },
  {
    kind: "create_codex_prompt",
    title: "Create Codex Prompt",
    description: "Draft a ready-to-run prompt for the next Codex session.",
    riskLevel: "yellow",
    permissionAction: "AI can modify code",
  },
];

const permissionRules: PermissionRule[] = [
  {
    id: "permission_summarize_project",
    action: "AI can summarize project",
    description: "Read local project context and generate a summary or risk brief.",
    target: "Project Hub",
    riskLevel: "green",
    defaultPolicy: "allow",
  },
  {
    id: "permission_create_task_draft",
    action: "AI can create task draft",
    description: "Create local task drafts from project context or AI output.",
    target: "Task Engine",
    riskLevel: "green",
    defaultPolicy: "allow",
  },
  {
    id: "permission_modify_code",
    action: "AI can modify code",
    description: "Change files in a repository after user-directed development work.",
    target: "Code workspace",
    riskLevel: "yellow",
    defaultPolicy: "confirm",
  },
  {
    id: "permission_send_message",
    action: "AI can send message",
    description: "Send email, Slack, WeChat, or other outbound communication.",
    target: "External communication",
    riskLevel: "red",
    defaultPolicy: "deny",
  },
  {
    id: "permission_trade_stocks",
    action: "AI can trade stocks",
    description: "Place orders, transfer funds, or operate broker accounts.",
    target: "Finance execution",
    riskLevel: "red",
    defaultPolicy: "deny",
  },
  {
    id: "permission_delete_files",
    action: "AI can delete files",
    description: "Delete user files, project folders, or durable records.",
    target: "Filesystem",
    riskLevel: "red",
    defaultPolicy: "deny",
  },
  {
    id: "permission_deploy_production",
    action: "AI can deploy production",
    description: "Deploy production services or change live infrastructure.",
    target: "Production",
    riskLevel: "red",
    defaultPolicy: "deny",
  },
];

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "audit_weios_summary_allowed",
    actor: "AI",
    action: "AI can summarize project",
    target: "WeiOS / KnowMe v2.0",
    riskLevel: "green",
    result: "allowed",
    detail: "Generated project focus from local mock Project Hub data.",
    createdAt: "2026-07-06T10:00:00.000Z",
  },
  {
    id: "audit_task_draft_allowed",
    actor: "AI",
    action: "AI can create task draft",
    target: "Task Engine",
    riskLevel: "green",
    result: "allowed",
    detail: "Converted reviewed AI output into a local task draft.",
    createdAt: "2026-07-06T10:08:00.000Z",
  },
  {
    id: "audit_code_change_approved",
    actor: "Wei",
    action: "AI can modify code",
    target: "WeiOS repository",
    riskLevel: "yellow",
    result: "approved",
    detail: "User authorized WeiOS frontend development in the local repository.",
    createdAt: "2026-07-06T10:16:00.000Z",
  },
  {
    id: "audit_finance_trade_blocked",
    actor: "AI",
    action: "AI can trade stocks",
    target: "Flutter Finance",
    riskLevel: "red",
    result: "blocked",
    detail: "Finance actions stay analysis-only; trade and transfer execution are blocked.",
    createdAt: "2026-07-06T10:24:00.000Z",
  },
];

const tasks: TaskRecord[] = [
  {
    id: "task_1",
    title: "完成 WeiOS monorepo 初始化",
    description: "共享类型、API、文档、Web 和 Flutter 壳子先跑通。",
    projectId: "project_weios",
    priority: "critical",
    status: "doing",
    source: "planning-doc",
    owner: "Wei",
    createdBy: "user",
    sourceType: "manual",
    aiAssistable: true,
    requiresApproval: false,
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "task_2",
    title: "确认 Planfit Builder API 时间表",
    description: "把延期风险转成项目风险和行动项。",
    projectId: "project_planfit",
    priority: "high",
    status: "todo",
    source: "manual-import",
    owner: "Wei",
    createdBy: "ai",
    sourceType: "import",
    sourceId: "memory_planfit_builder_risk",
    aiAssistable: true,
    requiresApproval: false,
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "task_3",
    title: "设计 Memory Summary 接口验收样例",
    description: "用微信/钉钉摘要粘贴文本验证事实、任务、风险抽取。",
    projectId: "project_weios",
    priority: "high",
    status: "todo",
    source: "roadmap",
    owner: "Wei",
    createdBy: "user",
    sourceType: "manual",
    aiAssistable: true,
    requiresApproval: false,
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "task_4",
    title: "把 Web Dashboard 接到真实 API",
    description: "从静态数据切换到 Project/Memory/Task API。",
    projectId: "project_weios",
    priority: "medium",
    status: "todo",
    source: "mvp-followup",
    owner: "Wei",
    createdBy: "ai",
    sourceType: "ai_output",
    sourceId: "ai_weios_daily_focus",
    aiAssistable: true,
    requiresApproval: true,
    createdAt: "2026-07-06T00:00:00.000Z",
    updatedAt: "2026-07-06T00:00:00.000Z",
  },
];

const projects: ProjectSummary[] = [
  {
    id: "project_weios",
    name: "WeiOS / KnowMe v2.0",
    status: "active",
    priority: 1,
    goals: ["Project Hub", "Memory Engine", "AI Summary", "Security Center"],
    currentState: "Project Hub + Memory Engine + AI Summary bootstrap.",
  },
  {
    id: "project_planfit",
    name: "Planfit",
    status: "active",
    priority: 2,
    goals: ["Clarify Builder API delivery", "Track launch blockers"],
    currentState: "Builder API timeline risk needs confirmation.",
  },
  {
    id: "project_itms",
    name: "iTMS",
    status: "active",
    priority: 3,
    goals: ["Centralize status", "Track risks", "Preserve decisions"],
    currentState: "Awaiting first project import.",
  },
  {
    id: "project_flutter_finance",
    name: "Flutter Finance",
    status: "active",
    priority: 4,
    goals: ["Asset overview", "Risk reminders", "Decision records"],
    currentState: "Finance automation must remain analysis-only for MVP.",
  },
  {
    id: "project_ai_video",
    name: "AI Video",
    status: "idea",
    priority: 5,
    goals: ["Capture context", "Track next experiments"],
    currentState: "In future project pool.",
  },
  {
    id: "project_ielts",
    name: "IELTS Learning",
    status: "active",
    priority: 6,
    goals: ["Track study plan", "Capture learning memory"],
    currentState: "Awaiting initial import.",
  },
  {
    id: "project_investment",
    name: "Investment Management",
    status: "active",
    priority: 7,
    goals: ["Decision records", "Risk reminders", "Cash-flow planning"],
    currentState: "Analysis allowed. Trading blocked.",
  },
];

const mockMemories: MemoryRecord[] = [
  {
    id: "memory_weios_principle",
    type: "Fact",
    title: "WeiOS core principle",
    content: "不是人围着工具转，而是所有工具、数据、AI 围绕人运转。",
    projectId: "project_weios",
    tags: ["principle", "identity", "context"],
    source: "planning-doc",
    createdAt: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "memory_mvp_focus",
    type: "Decision",
    title: "MVP focuses on Project Hub, Memory Engine, and AI Summary",
    content: "第一阶段先做 Project Hub、Memory Engine 和 AI Summary。",
    projectId: "project_weios",
    tags: ["mvp", "decision", "scope"],
    source: "planning-doc",
    createdAt: "2026-06-30T00:00:00.000Z",
  },
  {
    id: "memory_weios_permission_lesson",
    type: "Lesson",
    title: "Permission-first keeps WeiOS calm",
    content:
      "所有外部系统集成先走手动导入和确认队列，再考虑自动读取或自动执行。",
    projectId: "project_weios",
    tags: ["permission", "safety", "mvp"],
    source: "openclaw-safety-note",
    createdAt: "2026-07-06T00:00:00.000Z",
  },
  {
    id: "memory_planfit_builder_risk",
    type: "Risk",
    title: "Builder API possible delay",
    content:
      "Chris may need to confirm whether Builder API delivery moves to late July.",
    projectId: "project_planfit",
    tags: ["planfit", "builder-api", "risk"],
    source: "manual-import",
    createdAt: "2026-07-06T00:00:00.000Z",
  },
  {
    id: "memory_planfit_fallback_idea",
    type: "Idea",
    title: "Prepare a fallback launch lane",
    content:
      "如果 Builder API 延期，先设计不依赖完整 Builder API 的 launch fallback。",
    projectId: "project_planfit",
    tags: ["launch", "fallback", "product"],
    source: "project-hub",
    createdAt: "2026-07-06T00:00:00.000Z",
  },
  {
    id: "memory_itms_import_fact",
    type: "Fact",
    title: "iTMS needs first structured import",
    content:
      "iTMS 已进入 WeiOS 项目池，但还缺少项目简介、风险、资源和近期决策。",
    projectId: "project_itms",
    tags: ["itms", "intake", "project-brief"],
    source: "project-hub",
    createdAt: "2026-07-06T00:00:00.000Z",
  },
  {
    id: "memory_itms_next_lesson",
    type: "Lesson",
    title: "Start unknown projects with a brief",
    content:
      "没有上下文的项目不要直接生成任务，先要求项目简介、当前状态、负责人和阻塞点。",
    projectId: "project_itms",
    tags: ["workflow", "project-intake"],
    source: "memory-engine-v0",
    createdAt: "2026-07-06T00:00:00.000Z",
  },
  {
    id: "memory_finance_readonly_decision",
    type: "Decision",
    title: "Flutter Finance is read-only for MVP",
    content:
      "AI may summarize and analyze financial context, but must not trade, transfer, or log in to brokers.",
    projectId: "project_flutter_finance",
    tags: ["finance", "permission", "red-action"],
    source: "security-design",
    createdAt: "2026-07-06T00:00:00.000Z",
  },
  {
    id: "memory_finance_execution_risk",
    type: "Risk",
    title: "Financial execution remains blocked",
    content:
      "交易、转账和券商自动化属于红色动作，MVP 阶段只记录决策和风险，不执行。",
    projectId: "project_flutter_finance",
    tags: ["finance", "risk", "blocked-action"],
    source: "permission-policy",
    createdAt: "2026-06-30T00:00:00.000Z",
  },
];

const projectHubDetails: Record<string, ProjectHubDetails> = {
  project_weios: {
    overview:
      "WeiOS is the owner-controlled operating layer for projects, memory, tasks, AI roles, and permission-first automation.",
    currentProblems: [
      {
        id: "problem_weios_static_data",
        title: "Dashboard still uses mock data",
        description:
          "The frontend can navigate, but Project, Memory, and Task state still need durable API/database wiring.",
        severity: "medium",
      },
      {
        id: "problem_weios_scope",
        title: "Integration scope can grow too fast",
        description:
          "WeChat, DingTalk, finance, and browser automation should wait until Project Hub and Memory Engine are stable.",
        severity: "high",
      },
    ],
    risks: [
      {
        id: "risk_weios_permissions",
        title: "Permission framework must stay first-class",
        description:
          "If integrations arrive before permission checks, agent actions become hard to audit.",
        severity: "high",
        status: "monitoring",
        owner: "Wei",
        createdAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    nextActions: [
      tasks[3]!,
      {
        id: "task_weios_project_hub",
        title: "Upgrade Projects page into Project Hub",
        description:
          "Add overview, problems, actions, memories, resources, and AI actions per project.",
        projectId: "project_weios",
        priority: "high",
        status: "doing",
        source: "user-request",
        owner: "Wei",
        createdBy: "user",
        createdAt: "2026-07-06T00:00:00.000Z",
        updatedAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    relatedMemories: mockMemories.filter(
      (memory) => memory.projectId === "project_weios",
    ),
    resources: [
      {
        id: "resource_weios_prd",
        title: "PRD",
        kind: "doc",
        location: "docs/PRD.md",
        owner: "Wei",
      },
      {
        id: "resource_weios_architecture",
        title: "Architecture",
        kind: "doc",
        location: "docs/ARCHITECTURE.md",
        owner: "Wei",
      },
      {
        id: "resource_weios_web",
        title: "Web app",
        kind: "repo",
        location: "apps/web-next",
        owner: "Wei",
      },
    ],
    aiActions: [
      {
        id: "ai_weios_daily_focus",
        title: "Generate daily focus",
        description:
          "Summarize active projects and propose the top three actions for today.",
        riskLevel: "green",
      },
      {
        id: "ai_weios_memory_import",
        title: "Summarize pasted chat",
        description:
          "Extract facts, risks, tasks, and suggested memory items from manually pasted text.",
        riskLevel: "green",
      },
      {
        id: "ai_weios_formal_memory_write",
        title: "Write durable memory",
        description:
          "Persist selected memory items after review and confirmation.",
        riskLevel: "yellow",
      },
    ],
  },
  project_planfit: {
    overview:
      "Planfit needs one operational view for launch readiness, Builder API dependency, stakeholder follow-up, and product decisions.",
    currentProblems: [
      {
        id: "problem_planfit_builder_api",
        title: "Builder API timeline is unclear",
        description:
          "The current launch path depends on confirming whether Builder API delivery slips to late July.",
        severity: "high",
      },
      {
        id: "problem_planfit_context",
        title: "Project context is scattered",
        description:
          "Status, decisions, risks, and messages need to be consolidated before AI can suggest reliable next steps.",
        severity: "medium",
      },
    ],
    risks: [
      {
        id: "risk_builder_api_delay",
        title: "Builder API delivery may slip",
        description:
          "A delivery slip would affect launch timing and require a revised fallback plan.",
        severity: "high",
        status: "open",
        owner: "Wei",
        createdAt: "2026-06-30T00:00:00.000Z",
      },
    ],
    nextActions: [
      tasks[1]!,
      {
        id: "task_planfit_fallback",
        title: "Draft fallback launch plan",
        description:
          "Prepare options if Builder API is delayed beyond the current launch window.",
        projectId: "project_planfit",
        priority: "high",
        status: "todo",
        source: "project-hub",
        owner: "Wei",
        createdBy: "ai",
        createdAt: "2026-07-06T00:00:00.000Z",
        updatedAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    relatedMemories: mockMemories.filter(
      (memory) => memory.projectId === "project_planfit",
    ),
    resources: [
      {
        id: "resource_planfit_api",
        title: "Production API",
        kind: "dashboard",
        location: "api.planfit.com.au",
        owner: "Wei",
      },
      {
        id: "resource_planfit_repo",
        title: "Planfit repository",
        kind: "repo",
        location: "workspace/private-finance-advisor or Planfit repo",
        owner: "Wei",
      },
    ],
    aiActions: [
      {
        id: "ai_planfit_risk_summary",
        title: "Summarize launch risks",
        description:
          "Build a concise risk brief from current problems, next actions, and recent memories.",
        riskLevel: "green",
      },
      {
        id: "ai_planfit_chris_draft",
        title: "Draft message to Chris",
        description:
          "Prepare a confirmation message without sending it.",
        riskLevel: "yellow",
      },
    ],
  },
  project_itms: {
    overview:
      "iTMS is ready for first import: capture current state, ownership, risks, and repositories.",
    currentProblems: [
      {
        id: "problem_itms_import",
        title: "No structured import yet",
        description:
          "WeiOS needs an initial project brief before it can track tasks and risks.",
        severity: "medium",
      },
    ],
    risks: [],
    nextActions: [
      {
        id: "task_itms_import",
        title: "Create iTMS project brief",
        description:
          "Paste current status, active blockers, repositories, and recent decisions.",
        projectId: "project_itms",
        priority: "medium",
        status: "todo",
        source: "project-hub",
        owner: "Wei",
        createdBy: "ai",
        createdAt: "2026-07-06T00:00:00.000Z",
        updatedAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    relatedMemories: mockMemories.filter(
      (memory) => memory.projectId === "project_itms",
    ),
    resources: [
      {
        id: "resource_itms_placeholder",
        title: "Initial import folder",
        kind: "folder",
        location: "OpenClawSandbox/iTMS",
        owner: "Wei",
      },
    ],
    aiActions: [
      {
        id: "ai_itms_create_brief",
        title: "Create initial brief",
        description:
          "Turn pasted notes into project overview, risks, and next actions.",
        riskLevel: "green",
      },
    ],
  },
  project_flutter_finance: {
    overview:
      "Flutter Finance tracks personal finance decisions and product direction, while keeping all trading and fund movement blocked.",
    currentProblems: [
      {
        id: "problem_finance_boundary",
        title: "Analysis/action boundary must be explicit",
        description:
          "The system should support analysis and decision memory, but never execute trades or transfers.",
        severity: "high",
      },
    ],
    risks: [
      {
        id: "risk_finance_red_actions",
        title: "Financial actions are red-level",
        description:
          "Trading, transfers, and broker automation remain blocked by default.",
        severity: "critical",
        status: "monitoring",
        owner: "Wei",
        createdAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    nextActions: [
      {
        id: "task_finance_scope",
        title: "Define finance read-only scope",
        description:
          "List data types allowed for analysis and data types that stay blocked.",
        projectId: "project_flutter_finance",
        priority: "medium",
        status: "todo",
        source: "project-hub",
        owner: "Wei",
        createdBy: "ai",
        createdAt: "2026-07-06T00:00:00.000Z",
        updatedAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    relatedMemories: mockMemories.filter(
      (memory) => memory.projectId === "project_flutter_finance",
    ),
    resources: [
      {
        id: "resource_finance_app",
        title: "Flutter desktop shell",
        kind: "repo",
        location: "apps/desktop-flutter",
        owner: "Wei",
      },
    ],
    aiActions: [
      {
        id: "ai_finance_decision_note",
        title: "Draft decision note",
        description:
          "Summarize a user-provided finance decision and risks for review.",
        riskLevel: "green",
      },
      {
        id: "ai_finance_trade_block",
        title: "Trade or transfer",
        description:
          "Blocked action category. Requires explicit separate system design before any implementation.",
        riskLevel: "red",
      },
    ],
  },
  project_ai_video: {
    overview:
      "AI Video is in the idea pool and needs lightweight context capture before active execution.",
    currentProblems: [
      {
        id: "problem_video_undefined",
        title: "Direction not yet selected",
        description:
          "The project needs a first brief: product angle, assets, pipeline, and target output.",
        severity: "low",
      },
    ],
    risks: [],
    nextActions: [],
    relatedMemories: [],
    resources: [],
    aiActions: [
      {
        id: "ai_video_brainstorm",
        title: "Generate project options",
        description:
          "Create a small set of possible AI video directions from current notes.",
        riskLevel: "green",
      },
    ],
  },
  project_ielts: {
    overview:
      "IELTS Learning needs a study plan, progress memory, and weekly review loop.",
    currentProblems: [
      {
        id: "problem_ielts_plan",
        title: "Study plan not imported",
        description:
          "WeiOS has the project entry but no active schedule, score baseline, or weekly tasks yet.",
        severity: "medium",
      },
    ],
    risks: [],
    nextActions: [
      {
        id: "task_ielts_plan",
        title: "Create weekly IELTS study plan",
        description:
          "Capture target score, test date, weak sections, and daily study slots.",
        projectId: "project_ielts",
        priority: "medium",
        status: "todo",
        source: "project-hub",
        owner: "Wei",
        createdBy: "ai",
        createdAt: "2026-07-06T00:00:00.000Z",
        updatedAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    relatedMemories: [],
    resources: [],
    aiActions: [
      {
        id: "ai_ielts_week",
        title: "Plan this week",
        description:
          "Draft a focused weekly IELTS plan from goals and weak areas.",
        riskLevel: "green",
      },
    ],
  },
  project_investment: {
    overview:
      "Investment Management stores decision records, risk notes, and cash planning context without executing financial actions.",
    currentProblems: [
      {
        id: "problem_investment_manual_data",
        title: "Data is not normalized",
        description:
          "Holdings, cash, and investment decisions need a common import format before analytics.",
        severity: "medium",
      },
    ],
    risks: [
      {
        id: "risk_investment_execution",
        title: "Execution must remain blocked",
        description:
          "AI can analyze user-provided data but cannot place orders or move funds.",
        severity: "critical",
        status: "monitoring",
        owner: "Wei",
        createdAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    nextActions: [
      {
        id: "task_investment_template",
        title: "Create investment decision template",
        description:
          "Define fields for thesis, allocation, risk, review date, and exit condition.",
        projectId: "project_investment",
        priority: "medium",
        status: "todo",
        source: "project-hub",
        owner: "Wei",
        createdBy: "ai",
        createdAt: "2026-07-06T00:00:00.000Z",
        updatedAt: "2026-07-06T00:00:00.000Z",
      },
    ],
    relatedMemories: [],
    resources: [
      {
        id: "resource_investment_notes",
        title: "Decision records",
        kind: "note",
        location: "manual import",
        owner: "Wei",
      },
    ],
    aiActions: [
      {
        id: "ai_investment_review",
        title: "Review decision notes",
        description:
          "Summarize user-provided investment notes and flag risk concentration.",
        riskLevel: "green",
      },
    ],
  },
};

const agents: Pick<
  Agent,
  "id" | "name" | "role" | "provider" | "model" | "permissions" | "enabled"
>[] = [
  {
    id: "agent_planner",
    name: "Planner",
    role: "planner",
    provider: "openai",
    model: "gpt-5",
    permissions: ["project.read", "memory.read", "task.write"],
    enabled: true,
  },
  {
    id: "agent_architect",
    name: "Architect",
    role: "architect",
    provider: "anthropic",
    model: "claude",
    permissions: ["project.read", "memory.read"],
    enabled: true,
  },
  {
    id: "agent_coder",
    name: "Coder",
    role: "coder",
    provider: "local",
    model: "codex",
    permissions: ["project.read", "memory.read", "task.write"],
    enabled: true,
  },
];

const navItems: ActiveView[] = [
  "Dashboard",
  "Projects",
  "Memories",
  "Tasks",
  "AI Team",
  "Permissions",
  "Settings",
];

export default function WeiOsPage() {
  const [activeView, setActiveView] = useState<ActiveView>("Dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState("project_weios");
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>(tasks);
  const [memoryRecords, setMemoryRecords] =
    useState<MemoryRecord[]>(mockMemories);
  const [selectedMemoryId, setSelectedMemoryId] = useState(mockMemories[0]!.id);
  const [aiOutput, setAiOutput] = useState<GeneratedAiOutput | null>(null);
  const [auditRecords, setAuditRecords] =
    useState<AuditLogEntry[]>(mockAuditLogs);
  const [projectMemoryTypeFilter, setProjectMemoryTypeFilter] =
    useState<MemoryTypeFilter>("All");
  const [memoryListTypeFilter, setMemoryListTypeFilter] =
    useState<MemoryTypeFilter>("All");
  const [rawText, setRawText] = useState(
    "Chris: Builder API 可能延期到 7 月底。需要确认新的时间表，并评估 Planfit 上线风险。",
  );
  const [summaryResult, setSummaryResult] =
    useState<MemorySummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const projectHubRecords = useMemo(
    () =>
      projects.map((project) => {
        const details = projectHubDetails[project.id];
        const baseActionIds = new Set(details.nextActions.map((task) => task.id));

        return {
          ...project,
          ...details,
          nextActions: [
            ...details.nextActions,
            ...taskRecords.filter(
              (task) => task.projectId === project.id && !baseActionIds.has(task.id),
            ),
          ],
          relatedMemories: memoryRecords.filter(
            (memory) => memory.projectId === project.id,
          ),
        };
      }),
    [memoryRecords, taskRecords],
  );

  const selectedProject = useMemo(
    () =>
      projectHubRecords.find((project) => project.id === selectedProjectId) ??
      projectHubRecords[0]!,
    [projectHubRecords, selectedProjectId],
  );

  const selectedMemory = useMemo(
    () =>
      memoryRecords.find((memory) => memory.id === selectedMemoryId) ??
      memoryRecords[0]!,
    [memoryRecords, selectedMemoryId],
  );

  const filteredMemoryRecords = useMemo(
    () => filterMemoriesByType(memoryRecords, memoryListTypeFilter),
    [memoryListTypeFilter, memoryRecords],
  );

  const pendingApprovalCount = useMemo(
    () => auditRecords.filter((record) => record.result === "queued").length,
    [auditRecords],
  );

  async function summarizeMemory() {
    setIsSummarizing(true);
    setSummaryError("");

    try {
      const response = await fetch("http://localhost:3100/memories/summarize", {
        body: JSON.stringify({
          rawText,
          projectId: selectedProjectId,
          source: "manual-import",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      setSummaryResult((await response.json()) as MemorySummaryResult);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSummarizing(false);
    }
  }

  function createMemory(draft: MemoryFormDraft) {
    const memory: MemoryRecord = {
      id: `memory_manual_${Date.now()}`,
      type: draft.type,
      title: draft.title.trim(),
      content: draft.content.trim(),
      projectId: draft.projectId,
      tags: parseTags(draft.tags),
      source: draft.source.trim() || "manual",
      createdAt: new Date().toISOString(),
    };

    setMemoryRecords((current) => [memory, ...current]);
    setSelectedMemoryId(memory.id);
    setSelectedProjectId(memory.projectId);
  }

  function addMemoryToProject(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveView("Memories");
  }

  function selectMemoryListTypeFilter(filter: MemoryTypeFilter) {
    setMemoryListTypeFilter(filter);

    const nextMemory = filterMemoriesByType(memoryRecords, filter)[0];
    if (nextMemory) {
      setSelectedMemoryId(nextMemory.id);
    }
  }

  function runAiAction(action: AiActionKind, project: ProjectHubRecord) {
    const output = createMockAiOutput(action, project);

    setAiOutput(output);
    setAuditRecords((current) => [createAuditLogForAiOutput(output), ...current]);
  }

  function saveAiOutputAsMemory(output: GeneratedAiOutput) {
    createMemory({
      type: output.memoryType,
      title: output.title,
      content: output.content,
      projectId: output.projectId,
      tags: `ai-action, ${output.action}`,
      source: "ai-action",
    });
    setProjectMemoryTypeFilter("All");
    setAiOutput(null);
  }

  function convertAiOutputToTask(output: GeneratedAiOutput) {
    const now = new Date().toISOString();

    setTaskRecords((current) => [
      {
        id: `task_ai_${Date.now()}`,
        title: output.taskTitle,
        description: output.taskDescription,
        projectId: output.projectId,
        priority: output.action === "extract_risks" ? "high" : "medium",
        status: "todo",
        source: "ai-action",
        owner: "Wei",
        createdBy: "ai",
        sourceType: "ai_output",
        sourceId: output.id,
        aiAssistable: true,
        requiresApproval: output.action === "create_codex_prompt",
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
    setAiOutput(null);
  }

  function createManualTask(draft: TaskFormDraft) {
    const now = new Date().toISOString();

    setTaskRecords((current) => [
      {
        id: `task_manual_${Date.now()}`,
        title: draft.title.trim(),
        description: draft.description.trim(),
        projectId: draft.projectId,
        priority: draft.priority,
        status: "todo",
        source: draft.sourceType,
        owner: "Wei",
        createdBy: "user",
        sourceType: draft.sourceType,
        aiAssistable: draft.aiAssistable,
        requiresApproval: draft.requiresApproval,
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
    setSelectedProjectId(draft.projectId);
  }

  function updateTaskStatus(taskId: string, status: Task["status"]) {
    const now = new Date().toISOString();

    setTaskRecords((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: now,
            }
          : task,
      ),
    );
  }

  function discardAiOutput(outputId: string) {
    setAiOutput((current) => (current?.id === outputId ? null : current));
  }

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="WeiOS navigation">
        <div className="brand">
          <div className="brandMark">W</div>
          <div>
            <strong>WeiOS</strong>
            <span>Personal AI OS</span>
          </div>
        </div>
        <nav className="navList">
          {navItems.map((item) => (
            <button
              className={item === activeView ? "navItem active" : "navItem"}
              key={item}
              onClick={() => setActiveView(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeView}</p>
            <h1>{viewTitle(activeView)}</h1>
          </div>
          <div className="statusPill">Permission First</div>
        </header>

        {activeView === "Dashboard" && (
          <DashboardView
            onGoTo={setActiveView}
            selectedProject={selectedProject}
            setSelectedProjectId={setSelectedProjectId}
            summarizeMemory={summarizeMemory}
            rawText={rawText}
            setRawText={setRawText}
            summaryResult={summaryResult}
            isSummarizing={isSummarizing}
            summaryError={summaryError}
            memoryCount={memoryRecords.length}
            pendingApprovalCount={pendingApprovalCount}
            tasks={taskRecords}
          />
        )}
        {activeView === "Projects" && (
          <ProjectsView
            aiOutput={aiOutput}
            convertAiOutputToTask={convertAiOutputToTask}
            discardAiOutput={discardAiOutput}
            projectHubRecords={projectHubRecords}
            projectMemoryTypeFilter={projectMemoryTypeFilter}
            runAiAction={runAiAction}
            saveAiOutputAsMemory={saveAiOutputAsMemory}
            selectedProject={selectedProject}
            selectedProjectId={selectedProjectId}
            setProjectMemoryTypeFilter={setProjectMemoryTypeFilter}
            setSelectedProjectId={setSelectedProjectId}
            addMemoryToProject={addMemoryToProject}
          />
        )}
        {activeView === "Memories" && (
          <MemoriesView
            rawText={rawText}
            setRawText={setRawText}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            summarizeMemory={summarizeMemory}
            summaryResult={summaryResult}
            isSummarizing={isSummarizing}
            summaryError={summaryError}
            memoryRecords={memoryRecords}
            filteredMemoryRecords={filteredMemoryRecords}
            memoryListTypeFilter={memoryListTypeFilter}
            selectedMemory={selectedMemory}
            selectedMemoryId={selectedMemory.id}
            setMemoryListTypeFilter={selectMemoryListTypeFilter}
            setSelectedMemoryId={setSelectedMemoryId}
            createMemory={createMemory}
          />
        )}
        {activeView === "Tasks" && (
          <TasksView
            createManualTask={createManualTask}
            selectedProjectId={selectedProjectId}
            tasks={taskRecords}
            updateTaskStatus={updateTaskStatus}
          />
        )}
        {activeView === "AI Team" && <AgentsView />}
        {activeView === "Permissions" && (
          <PermissionsView auditRecords={auditRecords} />
        )}
        {activeView === "Settings" && <SettingsView />}
      </section>
    </main>
  );
}

function DashboardView({
  onGoTo,
  selectedProject,
  setSelectedProjectId,
  tasks: rows,
  summarizeMemory,
  rawText,
  setRawText,
  summaryResult,
  isSummarizing,
  summaryError,
  memoryCount,
  pendingApprovalCount,
}: {
  onGoTo: (view: ActiveView) => void;
  selectedProject: Pick<
    Project,
    "id" | "name" | "status" | "priority" | "goals" | "currentState"
  >;
  setSelectedProjectId: (projectId: string) => void;
  tasks: Task[];
  summarizeMemory: () => Promise<void>;
  rawText: string;
  setRawText: (value: string) => void;
  summaryResult: MemorySummaryResult | null;
  isSummarizing: boolean;
  summaryError: string;
  memoryCount: number;
  pendingApprovalCount: number;
}) {
  return (
    <>
      <section className="metricGrid" aria-label="WeiOS status">
        <Metric label="Active projects" value="7" tone="blue" />
        <Metric label="Open risks" value="2" tone="amber" />
        <Metric
          label="Pending approvals"
          value={String(pendingApprovalCount)}
          tone="green"
        />
        <Metric label="Memory items" value={String(memoryCount)} tone="gray" />
      </section>

      <section className="contentGrid">
        <section className="panel spanTwo">
          <div className="panelHeader">
            <h2>今天最重要的 3 件事</h2>
            <button className="textButton" onClick={() => onGoTo("Tasks")} type="button">
              View tasks
            </button>
          </div>
          <TaskList tasks={rows.slice(0, 3)} />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>待确认动作</h2>
            <button
              className="textButton"
              onClick={() => onGoTo("Permissions")}
              type="button"
            >
              View queue
            </button>
          </div>
          <div className="emptyState">
            <strong>暂无待确认</strong>
            <p>红色动作默认拦截，黄色动作进入确认队列。</p>
          </div>
        </section>

        <section className="panel spanTwo">
          <div className="panelHeader">
            <h2>项目状态</h2>
            <button
              className="textButton"
              onClick={() => onGoTo("Projects")}
              type="button"
            >
              View projects
            </button>
          </div>
          <ProjectRows
            projects={projects.slice(0, 4)}
            selectedProjectId={selectedProject.id}
            setSelectedProjectId={setSelectedProjectId}
          />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>AI Team</h2>
            <button
              className="textButton"
              onClick={() => onGoTo("AI Team")}
              type="button"
            >
              View roles
            </button>
          </div>
          <AgentList compact />
        </section>

        <section className="panel spanFull">
          <MemoryImport
            rawText={rawText}
            setRawText={setRawText}
            selectedProjectId={selectedProject.id}
            setSelectedProjectId={setSelectedProjectId}
            summarizeMemory={summarizeMemory}
            summaryResult={summaryResult}
            isSummarizing={isSummarizing}
            summaryError={summaryError}
          />
        </section>
      </section>
    </>
  );
}

function ProjectsView({
  aiOutput,
  convertAiOutputToTask,
  discardAiOutput,
  projectHubRecords,
  projectMemoryTypeFilter,
  runAiAction,
  saveAiOutputAsMemory,
  selectedProject,
  selectedProjectId,
  setProjectMemoryTypeFilter,
  setSelectedProjectId,
  addMemoryToProject,
}: {
  aiOutput: GeneratedAiOutput | null;
  convertAiOutputToTask: (output: GeneratedAiOutput) => void;
  discardAiOutput: (outputId: string) => void;
  projectHubRecords: ProjectHubRecord[];
  projectMemoryTypeFilter: MemoryTypeFilter;
  runAiAction: (action: AiActionKind, project: ProjectHubRecord) => void;
  saveAiOutputAsMemory: (output: GeneratedAiOutput) => void;
  selectedProject: ProjectHubRecord;
  selectedProjectId: string;
  setProjectMemoryTypeFilter: (filter: MemoryTypeFilter) => void;
  setSelectedProjectId: (projectId: string) => void;
  addMemoryToProject: (projectId: string) => void;
}) {
  const visibleProjectMemories = filterMemoriesByType(
    selectedProject.relatedMemories,
    projectMemoryTypeFilter,
  );
  const projectMemoryEmptyText =
    selectedProject.relatedMemories.length === 0
      ? `No memories linked to ${selectedProject.name} yet.`
      : `No ${projectMemoryTypeFilter} memories linked to this project.`;
  const selectedProjectAiOutput =
    aiOutput?.projectId === selectedProject.id ? aiOutput : null;

  return (
    <section className="projectHubGrid">
      <section className="panel projectHubSidebar">
        <div className="panelHeader">
          <h2>项目列表</h2>
          <span>{projectHubRecords.length} projects</span>
        </div>
        <ProjectRows
          projects={projectHubRecords}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />
      </section>

      <div className="projectHubMain">
        <section className="panel spanFull">
          <div className="panelHeader">
            <h2>Overview</h2>
            <span>Priority {selectedProject.priority}</span>
          </div>
          <div className="projectOverview">
            <div className="detailStack">
              <strong>{selectedProject.name}</strong>
              <p>{selectedProject.overview}</p>
              <p>{selectedProject.currentState}</p>
              <div className="chipList">
                {selectedProject.goals.map((goal) => (
                  <span className="chip" key={goal}>
                    {goal}
                  </span>
                ))}
              </div>
            </div>
            <div className="overviewGrid">
              <OverviewStat label="Status" value={selectedProject.status} />
              <OverviewStat
                label="Problems"
                value={String(selectedProject.currentProblems.length)}
              />
              <OverviewStat
                label="Risks"
                value={String(selectedProject.risks.length)}
              />
              <OverviewStat
                label="Resources"
                value={String(selectedProject.resources.length)}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Current Problems</h2>
            <span>
              {selectedProject.currentProblems.length + selectedProject.risks.length}{" "}
              open
            </span>
          </div>
          <ProblemList
            problems={selectedProject.currentProblems}
            risks={selectedProject.risks}
          />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Next Actions</h2>
            <span>{selectedProject.nextActions.length} tasks</span>
          </div>
          <TaskList tasks={selectedProject.nextActions} />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Memories</h2>
            <span>
              {visibleProjectMemories.length} /{" "}
              {selectedProject.relatedMemories.length} records
            </span>
          </div>
          <div className="memoryToolbar">
            <MemoryTypeFilterControls
              value={projectMemoryTypeFilter}
              onChange={setProjectMemoryTypeFilter}
            />
            <button
              className="secondaryButton"
              onClick={() => addMemoryToProject(selectedProject.id)}
              type="button"
            >
              Add Memory to this Project
            </button>
          </div>
          <ProjectMemoryList
            emptyText={projectMemoryEmptyText}
            memories={visibleProjectMemories}
          />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Resources</h2>
            <span>{selectedProject.resources.length} links</span>
          </div>
          <ResourceList resources={selectedProject.resources} />
        </section>

        <section className="panel spanFull">
          <div className="panelHeader">
            <h2>AI Actions</h2>
            <span>mock output</span>
          </div>
          <AiActionPanel
            convertAiOutputToTask={convertAiOutputToTask}
            discardAiOutput={discardAiOutput}
            output={selectedProjectAiOutput}
            project={selectedProject}
            runAiAction={runAiAction}
            saveAiOutputAsMemory={saveAiOutputAsMemory}
          />
        </section>
      </div>
    </section>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="overviewStat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProblemList({
  problems,
  risks,
}: {
  problems: ProjectProblem[];
  risks: Risk[];
}) {
  if (problems.length === 0 && risks.length === 0) {
    return <EmptyList text="No current problems recorded." />;
  }

  return (
    <div className="sectionList">
      {problems.map((problem) => (
        <article className="problemRow" key={problem.id}>
          <span className={`severityPill ${problem.severity}`}>
            {problem.severity}
          </span>
          <div>
            <h3>{problem.title}</h3>
            <p>{problem.description}</p>
          </div>
        </article>
      ))}
      {risks.map((risk) => (
        <article className="problemRow" key={risk.id}>
          <span className={`severityPill ${risk.severity}`}>
            {risk.severity}
          </span>
          <div>
            <h3>{risk.title}</h3>
            <p>{risk.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectMemoryList({
  memories,
  emptyText,
}: {
  memories: MemoryRecord[];
  emptyText: string;
}) {
  if (memories.length === 0) {
    return <EmptyList text={emptyText} />;
  }

  return (
    <div className="sectionList">
      {memories.map((memory) => (
        <article className="compactItem" key={memory.id}>
          <div className="panelHeader compactHeader">
            <h3>{memory.title}</h3>
            <span>{memory.type}</span>
          </div>
          <p>{memory.content}</p>
          <div className="chipList">
            {memory.tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function MemoryTypeFilterControls({
  value,
  onChange,
}: {
  value: MemoryTypeFilter;
  onChange: (filter: MemoryTypeFilter) => void;
}) {
  return (
    <div className="filterBar" aria-label="Memory type filters">
      {memoryTypeFilters.map((filter) => (
        <button
          className={filter === value ? "filterButton active" : "filterButton"}
          key={filter}
          onClick={() => onChange(filter)}
          type="button"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function ResourceList({ resources }: { resources: ProjectResource[] }) {
  if (resources.length === 0) {
    return <EmptyList text="No resources linked yet." />;
  }

  return (
    <div className="sectionList">
      {resources.map((resource) => (
        <article className="resourceRow" key={resource.id}>
          <span className="resourceKind">{resource.kind}</span>
          <div>
            <h3>{resource.title}</h3>
            <p>{resource.location}</p>
          </div>
          <small>{resource.owner}</small>
        </article>
      ))}
    </div>
  );
}

function AiActionPanel({
  convertAiOutputToTask,
  discardAiOutput,
  output,
  project,
  runAiAction,
  saveAiOutputAsMemory,
}: {
  convertAiOutputToTask: (output: GeneratedAiOutput) => void;
  discardAiOutput: (outputId: string) => void;
  output: GeneratedAiOutput | null;
  project: ProjectHubRecord;
  runAiAction: (action: AiActionKind, project: ProjectHubRecord) => void;
  saveAiOutputAsMemory: (output: GeneratedAiOutput) => void;
}) {
  return (
    <div className="aiActionPanel">
      <div className="aiActionGrid">
        {aiActionDefinitions.map((action) => (
          <button
            className="aiActionCard"
            key={action.kind}
            onClick={() => runAiAction(action.kind, project)}
            type="button"
          >
            <div className="aiActionCardHeader">
              <strong>{action.title}</strong>
              <span className={`riskPill ${action.riskLevel}`}>
                {riskLabel(action.riskLevel)}
              </span>
            </div>
            <p>{action.description}</p>
          </button>
        ))}
      </div>

      {output ? (
        <article className="aiOutputBox">
          <div className="panelHeader compactHeader">
            <div>
              <h3>{output.title}</h3>
              <p>{output.projectName}</p>
            </div>
            <div className="aiOutputMeta">
              <span className={`riskPill ${output.riskLevel}`}>
                {riskLabel(output.riskLevel)}
              </span>
              <span>{formatDate(output.createdAt)}</span>
            </div>
          </div>
          <p className="aiOutputBody">{output.content}</p>
          <div className="outputActions">
            <button
              className="secondaryButton"
              onClick={() => runAiAction(output.action, project)}
              type="button"
            >
              Regenerate
            </button>
            <button
              className="secondaryButton"
              onClick={() => saveAiOutputAsMemory(output)}
              type="button"
            >
              Save as Memory
            </button>
            <button
              className="secondaryButton"
              onClick={() => convertAiOutputToTask(output)}
              type="button"
            >
              Convert to Task
            </button>
            <button
              className="ghostButton"
              onClick={() => discardAiOutput(output.id)}
              type="button"
            >
              Discard
            </button>
          </div>
        </article>
      ) : (
        <EmptyList text="Run an AI action to generate a mock output." />
      )}
    </div>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <div className="emptyList">
      <p>{text}</p>
    </div>
  );
}

function MemoriesView({
  rawText,
  setRawText,
  selectedProjectId,
  setSelectedProjectId,
  summarizeMemory,
  summaryResult,
  isSummarizing,
  summaryError,
  memoryRecords,
  filteredMemoryRecords,
  memoryListTypeFilter,
  selectedMemory,
  selectedMemoryId,
  setMemoryListTypeFilter,
  setSelectedMemoryId,
  createMemory,
}: {
  rawText: string;
  setRawText: (value: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (projectId: string) => void;
  summarizeMemory: () => Promise<void>;
  summaryResult: MemorySummaryResult | null;
  isSummarizing: boolean;
  summaryError: string;
  memoryRecords: MemoryRecord[];
  filteredMemoryRecords: MemoryRecord[];
  memoryListTypeFilter: MemoryTypeFilter;
  selectedMemory: MemoryRecord;
  selectedMemoryId: string;
  setMemoryListTypeFilter: (filter: MemoryTypeFilter) => void;
  setSelectedMemoryId: (memoryId: string) => void;
  createMemory: (draft: MemoryFormDraft) => void;
}) {
  const memoryListEmptyText =
    memoryRecords.length === 0
      ? "No memories created yet."
      : `No ${memoryListTypeFilter} memories found.`;

  return (
    <section className="memoryEngineGrid">
      <section className="panel memoryListPanel">
        <div className="panelHeader">
          <h2>Memory List</h2>
          <span>
            {filteredMemoryRecords.length} / {memoryRecords.length} records
          </span>
        </div>
        <MemoryTypeFilterControls
          value={memoryListTypeFilter}
          onChange={setMemoryListTypeFilter}
        />
        <MemoryRows
          emptyText={memoryListEmptyText}
          memories={filteredMemoryRecords}
          selectedMemoryId={selectedMemoryId}
          setSelectedMemoryId={setSelectedMemoryId}
        />
      </section>

      <section className="panel memoryDetailPanel">
        <MemoryDetail memory={selectedMemory} />
      </section>

      <section className="panel memoryCreatePanel">
        <ManualMemoryForm
          createMemory={createMemory}
          selectedProjectId={selectedProjectId}
        />
      </section>

      <section className="panel memoryImportPanel">
        <MemoryImport
          rawText={rawText}
          setRawText={setRawText}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          summarizeMemory={summarizeMemory}
          summaryResult={summaryResult}
          isSummarizing={isSummarizing}
          summaryError={summaryError}
        />
      </section>
    </section>
  );
}

function MemoryRows({
  memories,
  emptyText,
  selectedMemoryId,
  setSelectedMemoryId,
}: {
  memories: MemoryRecord[];
  emptyText: string;
  selectedMemoryId: string;
  setSelectedMemoryId: (memoryId: string) => void;
}) {
  if (memories.length === 0) {
    return <EmptyList text={emptyText} />;
  }

  return (
    <div className="memoryList">
      {memories.map((memory) => (
        <button
          className={
            memory.id === selectedMemoryId
              ? "memoryListButton selected"
              : "memoryListButton"
          }
          key={memory.id}
          onClick={() => setSelectedMemoryId(memory.id)}
          type="button"
        >
          <span className={`memoryTypePill ${memory.type.toLowerCase()}`}>
            {memory.type}
          </span>
          <strong>{memory.title}</strong>
          <small>{projectNameFor(memory.projectId)}</small>
        </button>
      ))}
    </div>
  );
}

function MemoryDetail({ memory }: { memory: MemoryRecord }) {
  return (
    <>
      <div className="panelHeader">
        <h2>Memory Detail</h2>
        <span>{formatDate(memory.createdAt)}</span>
      </div>
      <div className="memoryDetailStack">
        <div>
          <span className={`memoryTypePill ${memory.type.toLowerCase()}`}>
            {memory.type}
          </span>
          <h3>{memory.title}</h3>
        </div>
        <p className="memoryDetailBody">{memory.content}</p>
        <div className="memoryMetaGrid">
          <MemoryMeta label="Project" value={projectNameFor(memory.projectId)} />
          <MemoryMeta label="Source" value={memory.source} />
          <MemoryMeta label="Created" value={formatDate(memory.createdAt)} />
          <MemoryMeta label="Type" value={memory.type} />
        </div>
        <div className="chipList">
          {memory.tags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function MemoryMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="memoryMetaRow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ManualMemoryForm({
  createMemory,
  selectedProjectId,
}: {
  createMemory: (draft: MemoryFormDraft) => void;
  selectedProjectId: string;
}) {
  const [draft, setDraft] = useState<MemoryFormDraft>({
    type: "Decision",
    title: "",
    content: "",
    projectId: selectedProjectId,
    tags: "",
    source: "manual",
  });

  useEffect(() => {
    setDraft((current) => ({ ...current, projectId: selectedProjectId }));
  }, [selectedProjectId]);

  const canCreate = draft.title.trim().length > 0 && draft.content.trim().length > 0;

  function updateDraft<Key extends keyof MemoryFormDraft>(
    key: Key,
    value: MemoryFormDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submitMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCreate) {
      return;
    }

    createMemory(draft);
    setDraft((current) => ({
      ...current,
      title: "",
      content: "",
      tags: "",
    }));
  }

  return (
    <form className="manualMemoryForm" onSubmit={submitMemory}>
      <div className="panelHeader">
        <h2>Create Memory</h2>
        <span>Manual</span>
      </div>
      <div className="formGrid">
        <label className="field">
          <span>Type</span>
          <select
            className="select"
            onChange={(event) =>
              updateDraft("type", event.target.value as MemoryKind)
            }
            value={draft.type}
          >
            {memoryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Project</span>
          <select
            className="select"
            onChange={(event) => updateDraft("projectId", event.target.value)}
            value={draft.projectId}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field spanFull">
          <span>Title</span>
          <input
            className="input"
            onChange={(event) => updateDraft("title", event.target.value)}
            value={draft.title}
          />
        </label>
        <label className="field spanFull">
          <span>Content</span>
          <textarea
            onChange={(event) => updateDraft("content", event.target.value)}
            value={draft.content}
          />
        </label>
        <label className="field">
          <span>Tags</span>
          <input
            className="input"
            onChange={(event) => updateDraft("tags", event.target.value)}
            placeholder="comma separated"
            value={draft.tags}
          />
        </label>
        <label className="field">
          <span>Source</span>
          <input
            className="input"
            onChange={(event) => updateDraft("source", event.target.value)}
            value={draft.source}
          />
        </label>
      </div>
      <button className="primaryButton" disabled={!canCreate} type="submit">
        Create memory
      </button>
    </form>
  );
}

function TasksView({
  createManualTask,
  selectedProjectId,
  tasks: rows,
  updateTaskStatus,
}: {
  createManualTask: (draft: TaskFormDraft) => void;
  selectedProjectId: string;
  tasks: TaskRecord[];
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
}) {
  const [projectFilter, setProjectFilter] = useState<TaskProjectFilter>("All");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>("All");

  const filteredTasks = useMemo(
    () => filterTasks(rows, projectFilter, priorityFilter),
    [priorityFilter, projectFilter, rows],
  );

  return (
    <section className="taskEngineGrid">
      <section className="panel spanFull">
        <div className="panelHeader">
          <h2>Task Engine</h2>
          <span>
            {filteredTasks.length} / {rows.length} tasks
          </span>
        </div>
        <TaskFilters
          priorityFilter={priorityFilter}
          projectFilter={projectFilter}
          setPriorityFilter={setPriorityFilter}
          setProjectFilter={setProjectFilter}
        />
      </section>

      <section className="panel taskCreatePanel">
        <ManualTaskForm
          createManualTask={createManualTask}
          selectedProjectId={selectedProjectId}
        />
      </section>

      <section className="panel taskBoardPanel">
        <div className="taskBoard">
          {taskStatuses.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={filteredTasks.filter((task) => task.status === status)}
              updateTaskStatus={updateTaskStatus}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function TaskFilters({
  priorityFilter,
  projectFilter,
  setPriorityFilter,
  setProjectFilter,
}: {
  priorityFilter: TaskPriorityFilter;
  projectFilter: TaskProjectFilter;
  setPriorityFilter: (filter: TaskPriorityFilter) => void;
  setProjectFilter: (filter: TaskProjectFilter) => void;
}) {
  return (
    <div className="taskFilters">
      <label className="field">
        <span>Project</span>
        <select
          className="select"
          onChange={(event) => setProjectFilter(event.target.value)}
          value={projectFilter}
        >
          <option value="All">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Priority</span>
        <select
          className="select"
          onChange={(event) =>
            setPriorityFilter(event.target.value as TaskPriorityFilter)
          }
          value={priorityFilter}
        >
          {taskPriorityFilters.map((priority) => (
            <option key={priority} value={priority}>
              {priority === "All" ? "All priorities" : priority}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ManualTaskForm({
  createManualTask,
  selectedProjectId,
}: {
  createManualTask: (draft: TaskFormDraft) => void;
  selectedProjectId: string;
}) {
  const [draft, setDraft] = useState<TaskFormDraft>({
    title: "",
    description: "",
    projectId: selectedProjectId,
    priority: "medium",
    sourceType: "manual",
    aiAssistable: true,
    requiresApproval: false,
  });

  useEffect(() => {
    setDraft((current) => ({ ...current, projectId: selectedProjectId }));
  }, [selectedProjectId]);

  const canCreate = draft.title.trim().length > 0 && draft.description.trim().length > 0;

  function updateDraft<Key extends keyof TaskFormDraft>(
    key: Key,
    value: TaskFormDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCreate) {
      return;
    }

    createManualTask(draft);
    setDraft((current) => ({
      ...current,
      title: "",
      description: "",
    }));
  }

  return (
    <form className="manualTaskForm" onSubmit={submitTask}>
      <div className="panelHeader">
        <h2>Create Task</h2>
        <span>Manual</span>
      </div>
      <div className="formGrid">
        <label className="field spanFull">
          <span>Title</span>
          <input
            className="input"
            onChange={(event) => updateDraft("title", event.target.value)}
            value={draft.title}
          />
        </label>
        <label className="field spanFull">
          <span>Description</span>
          <textarea
            onChange={(event) => updateDraft("description", event.target.value)}
            value={draft.description}
          />
        </label>
        <label className="field">
          <span>Project</span>
          <select
            className="select"
            onChange={(event) => updateDraft("projectId", event.target.value)}
            value={draft.projectId}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Priority</span>
          <select
            className="select"
            onChange={(event) =>
              updateDraft("priority", event.target.value as Task["priority"])
            }
            value={draft.priority}
          >
            {taskPriorityFilters
              .filter((priority): priority is Task["priority"] => priority !== "All")
              .map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          <span>Source</span>
          <select
            className="select"
            onChange={(event) =>
              updateDraft("sourceType", event.target.value as TaskSourceType)
            }
            value={draft.sourceType}
          >
            <option value="manual">manual</option>
            <option value="memory">memory</option>
            <option value="ai_output">ai output</option>
            <option value="import">import</option>
          </select>
        </label>
        <div className="toggleGroup">
          <label className="toggleRow">
            <input
              checked={draft.aiAssistable}
              onChange={(event) =>
                updateDraft("aiAssistable", event.target.checked)
              }
              type="checkbox"
            />
            <span>AI assistable</span>
          </label>
          <label className="toggleRow">
            <input
              checked={draft.requiresApproval}
              onChange={(event) =>
                updateDraft("requiresApproval", event.target.checked)
              }
              type="checkbox"
            />
            <span>Approval required</span>
          </label>
        </div>
      </div>
      <button className="primaryButton" disabled={!canCreate} type="submit">
        Create task
      </button>
    </form>
  );
}

function TaskColumn({
  status,
  tasks: rows,
  updateTaskStatus,
}: {
  status: Task["status"];
  tasks: TaskRecord[];
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
}) {
  return (
    <section className="taskColumn">
      <div className="taskColumnHeader">
        <h3>{status}</h3>
        <span>{rows.length}</span>
      </div>
      {rows.length > 0 ? (
        <div className="taskColumnList">
          {rows.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              updateTaskStatus={updateTaskStatus}
            />
          ))}
        </div>
      ) : (
        <EmptyList text={`No ${status} tasks.`} />
      )}
    </section>
  );
}

function TaskCard({
  task,
  updateTaskStatus,
}: {
  task: TaskRecord;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
}) {
  return (
    <article className="taskCard">
      <div className="taskCardHeader">
        <span className={`priority ${task.priority}`}>{task.priority}</span>
        <span className={`taskStatus ${task.status}`}>{task.status}</span>
      </div>
      <div>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <div className="taskMetaGrid">
        <TaskMeta label="Project" value={projectNameFor(task.projectId)} />
        <TaskMeta label="Source" value={task.sourceType} />
      </div>
      <div className="chipList">
        <span className="chip">
          {task.aiAssistable ? "AI assistable" : "manual only"}
        </span>
        <span className="chip">
          {task.requiresApproval ? "approval required" : "no approval"}
        </span>
      </div>
      <div className="taskCardActions">
        {task.status !== "doing" ? (
          <button
            className="ghostButton"
            onClick={() => updateTaskStatus(task.id, "doing")}
            type="button"
          >
            Start
          </button>
        ) : null}
        {task.status !== "blocked" ? (
          <button
            className="ghostButton"
            onClick={() => updateTaskStatus(task.id, "blocked")}
            type="button"
          >
            Block
          </button>
        ) : null}
        {task.status !== "done" ? (
          <button
            className="secondaryButton"
            onClick={() => updateTaskStatus(task.id, "done")}
            type="button"
          >
            Done
          </button>
        ) : null}
      </div>
    </article>
  );
}

function TaskMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="taskMeta">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AgentsView() {
  return (
    <section className="contentGrid">
      <section className="panel spanFull">
        <div className="panelHeader">
          <h2>AI Team</h2>
          <span>{agents.length} agents</span>
        </div>
        <AgentList />
      </section>
    </section>
  );
}

function PermissionsView({
  auditRecords,
}: {
  auditRecords: AuditLogEntry[];
}) {
  const pendingRecords = auditRecords.filter(
    (record) => record.result === "queued",
  );

  return (
    <section className="permissionCenterGrid">
      <section className="panel spanFull">
        <div className="panelHeader">
          <h2>权限分级</h2>
          <span>Permission Center v0</span>
        </div>
        <div className="permissionSummaryGrid">
          <PermissionLevelCard
            level="green"
            title="Green"
            body="自动允许低风险、本地、可撤销的 AI 辅助动作。"
          />
          <PermissionLevelCard
            level="yellow"
            title="Yellow"
            body="进入确认队列，用户批准后才成为正式动作。"
          />
          <PermissionLevelCard
            level="red"
            title="Red"
            body="默认拦截外部发送、资金执行、删除和生产变更。"
          />
        </div>
      </section>

      <section className="panel spanTwo">
        <div className="panelHeader">
          <h2>默认权限规则</h2>
          <span>{permissionRules.length} rules</span>
        </div>
        <PermissionRuleList />
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h2>待确认动作</h2>
          <span>{pendingRecords.length} pending</span>
        </div>
        <PendingReviewQueue records={pendingRecords} />
      </section>

      <section className="panel spanFull">
        <div className="panelHeader">
          <h2>审计日志</h2>
          <span>{auditRecords.length} events</span>
        </div>
        <AuditLogList records={auditRecords} />
      </section>
    </section>
  );
}

function PermissionLevelCard({
  level,
  title,
  body,
}: {
  level: PermissionRiskLevel;
  title: string;
  body: string;
}) {
  const ruleCount = permissionRules.filter(
    (rule) => rule.riskLevel === level,
  ).length;

  return (
    <article className={`permissionLevelCard ${level}`}>
      <div className="panelHeader compactHeader">
        <h3>{title}</h3>
        <span>{ruleCount} rules</span>
      </div>
      <p>{body}</p>
    </article>
  );
}

function PermissionRuleList() {
  return (
    <div className="permissionRuleList">
      {permissionRules.map((rule) => (
        <article className={`permissionRuleRow ${rule.riskLevel}`} key={rule.id}>
          <div>
            <div className="permissionRuleTitle">
              <span className={`riskPill ${rule.riskLevel}`}>
                {riskLabel(rule.riskLevel)}
              </span>
              <h3>{rule.action}</h3>
            </div>
            <p>{rule.description}</p>
          </div>
          <div className="permissionRuleMeta">
            <PermissionMeta label="Target" value={rule.target} />
            <div className={`policyPill ${rule.defaultPolicy}`}>
              {policyLabel(rule.defaultPolicy)}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function PermissionMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="permissionMeta">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PendingReviewQueue({ records }: { records: AuditLogEntry[] }) {
  if (records.length === 0) {
    return (
      <div className="emptyState">
        <strong>队列为空</strong>
        <p>黄色动作会出现在这里；红色动作默认拦截，不进入确认队列。</p>
      </div>
    );
  }

  return (
    <div className="auditList">
      {records.map((record) => (
        <AuditLogRow compact key={record.id} record={record} />
      ))}
    </div>
  );
}

function AuditLogList({ records }: { records: AuditLogEntry[] }) {
  if (records.length === 0) {
    return <EmptyList text="No permission events recorded yet." />;
  }

  return (
    <div className="auditList">
      {records.map((record) => (
        <AuditLogRow key={record.id} record={record} />
      ))}
    </div>
  );
}

function AuditLogRow({
  compact = false,
  record,
}: {
  compact?: boolean;
  record: AuditLogEntry;
}) {
  return (
    <article className={compact ? "auditRow compact" : "auditRow"}>
      <div className="auditRowMain">
        <div className="permissionRuleTitle">
          <span className={`riskPill ${record.riskLevel}`}>
            {riskLabel(record.riskLevel)}
          </span>
          <h3>{record.action}</h3>
        </div>
        <p>{record.detail}</p>
      </div>
      <div className="auditRowMeta">
        <PermissionMeta label="Target" value={record.target} />
        {!compact ? <PermissionMeta label="Actor" value={record.actor} /> : null}
        <PermissionMeta label="Date" value={formatDate(record.createdAt)} />
        <div className={`auditResult ${record.result}`}>
          {auditResultLabel(record.result)}
        </div>
      </div>
    </article>
  );
}

function SettingsView() {
  return (
    <section className="contentGrid">
      <section className="panel spanTwo">
        <div className="panelHeader">
          <h2>本地服务</h2>
          <span>Development</span>
        </div>
        <div className="settingsGrid">
          <SettingRow label="Web Dashboard" value="http://localhost:3000" />
          <SettingRow label="API" value="http://localhost:3100" />
          <SettingRow label="OpenClaw Sandbox" value="weios/OpenClawSandbox" />
          <SettingRow label="Risk mode" value="permission-first" />
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h2>下一步</h2>
          <span>MVP</span>
        </div>
        <div className="detailStack">
          <p>把 Project、Memory、Task 页面切到真实数据库。</p>
          <p>接入 OpenClaw 时先走手动文本导入，不直接读取微信。</p>
        </div>
      </section>
    </section>
  );
}

function MemoryImport({
  rawText,
  setRawText,
  selectedProjectId,
  setSelectedProjectId,
  summarizeMemory,
  summaryResult,
  isSummarizing,
  summaryError,
}: {
  rawText: string;
  setRawText: (value: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (projectId: string) => void;
  summarizeMemory: () => Promise<void>;
  summaryResult: MemorySummaryResult | null;
  isSummarizing: boolean;
  summaryError: string;
}) {
  return (
    <>
      <div className="panelHeader">
        <h2>Memory Import</h2>
        <span>Manual Intake</span>
      </div>
      <div className="importBox">
        <div className="importEditor">
          <select
            aria-label="Project"
            className="select"
            onChange={(event) => setSelectedProjectId(event.target.value)}
            value={selectedProjectId}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <textarea
            aria-label="Raw communication text"
            onChange={(event) => setRawText(event.target.value)}
            value={rawText}
          />
          <button
            className="primaryButton"
            disabled={isSummarizing || rawText.trim().length === 0}
            onClick={summarizeMemory}
            type="button"
          >
            {isSummarizing ? "Summarizing..." : "Summarize"}
          </button>
        </div>
        <div className="summaryPreview">
          <strong>Summary Contract</strong>
          {summaryError ? <p className="errorText">{summaryError}</p> : null}
          {summaryResult ? (
            <div className="summaryStack">
              <p>{summaryResult.summary}</p>
              <p>
                facts: {summaryResult.extractedFacts.length} · tasks:{" "}
                {summaryResult.extractedTasks.length} · risks:{" "}
                {summaryResult.extractedRisks.length} · memories:{" "}
                {summaryResult.suggestedMemoryItems.length}
              </p>
            </div>
          ) : (
            <p>facts: 0 · tasks: 0 · risks: 0 · suggested memories: 0</p>
          )}
        </div>
      </div>
    </>
  );
}

function ProjectRows({
  projects: rows,
  selectedProjectId,
  setSelectedProjectId,
}: {
  projects: ProjectSummary[];
  selectedProjectId: string;
  setSelectedProjectId: (projectId: string) => void;
}) {
  return (
    <div className="projectTable">
      {rows.map((project) => (
        <button
          className={
            project.id === selectedProjectId ? "projectRow selected" : "projectRow"
          }
          key={project.id}
          onClick={() => setSelectedProjectId(project.id)}
          type="button"
        >
          <span className="rank">{project.priority}</span>
          <div>
            <h3>{project.name}</h3>
            <p>{project.currentState}</p>
          </div>
          <span className={`projectStatus ${project.status}`}>{project.status}</span>
        </button>
      ))}
    </div>
  );
}

function TaskList({ tasks: rows }: { tasks: Task[] }) {
  return (
    <div className="taskList">
      {rows.map((task) => (
        <article className="taskRow" key={task.id}>
          <div className={`priority ${task.priority}`}>{task.priority}</div>
          <div>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </div>
          <span className={`taskStatus ${task.status}`}>{task.status}</span>
        </article>
      ))}
    </div>
  );
}

function AgentList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "agentList" : "agentGrid"}>
      {agents.map((agent) => (
        <div className="agentRow" key={agent.id}>
          <strong>{agent.name}</strong>
          <span>{agent.role}</span>
          <small>
            {agent.provider} / {agent.model}
          </small>
          {!compact ? (
            <div className="chipList">
              {agent.permissions.map((permission) => (
                <span className="chip" key={permission}>
                  {permission}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="settingRow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "amber" | "green" | "gray";
}) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function viewTitle(view: ActiveView): string {
  switch (view) {
    case "Dashboard":
      return "私人 AI 控制中心";
    case "Projects":
      return "项目中枢";
    case "Memories":
      return "长期记忆";
    case "Tasks":
      return "任务引擎";
    case "AI Team":
      return "AI 团队";
    case "Permissions":
      return "权限中心";
    case "Settings":
      return "系统设置";
  }
}

function parseTags(rawTags: string): string[] {
  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function filterMemoriesByType(
  memories: MemoryRecord[],
  filter: MemoryTypeFilter,
): MemoryRecord[] {
  if (filter === "All") {
    return memories;
  }

  return memories.filter((memory) => memory.type === filter);
}

function filterTasks(
  tasks: TaskRecord[],
  projectFilter: TaskProjectFilter,
  priorityFilter: TaskPriorityFilter,
): TaskRecord[] {
  return tasks.filter((task) => {
    const matchesProject =
      projectFilter === "All" || task.projectId === projectFilter;
    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    return matchesProject && matchesPriority;
  });
}

function aiActionDefinitionFor(action: AiActionKind): AiActionDefinition {
  return (
    aiActionDefinitions.find((definition) => definition.kind === action) ??
    aiActionDefinitions[0]!
  );
}

function createAuditLogForAiOutput(output: GeneratedAiOutput): AuditLogEntry {
  const actionDefinition = aiActionDefinitionFor(output.action);
  const result: AuditLogResult =
    output.riskLevel === "green"
      ? "allowed"
      : output.riskLevel === "yellow"
        ? "queued"
        : "blocked";

  return {
    id: `audit_${output.id}`,
    actor: "AI",
    action: actionDefinition.permissionAction,
    target: output.projectName,
    riskLevel: output.riskLevel,
    result,
    detail:
      output.riskLevel === "yellow"
        ? "Generated local draft. User review is required before it becomes an execution prompt."
        : "Generated mock AI output from local Project Hub context.",
    createdAt: output.createdAt,
  };
}

function riskLabel(level: PermissionRiskLevel): string {
  switch (level) {
    case "green":
      return "Green";
    case "yellow":
      return "Yellow";
    case "red":
      return "Red";
  }
}

function policyLabel(policy: PermissionPolicy): string {
  switch (policy) {
    case "allow":
      return "Auto allow";
    case "confirm":
      return "Confirm first";
    case "deny":
      return "Denied";
  }
}

function auditResultLabel(result: AuditLogResult): string {
  switch (result) {
    case "allowed":
      return "Allowed";
    case "queued":
      return "Pending review";
    case "approved":
      return "Approved";
    case "blocked":
      return "Blocked";
  }
}

function createMockAiOutput(
  action: AiActionKind,
  project: ProjectHubRecord,
): GeneratedAiOutput {
  const now = new Date().toISOString();
  const actionDefinition = aiActionDefinitionFor(action);
  const openProblems = project.currentProblems
    .map((problem) => problem.title)
    .join(", ");
  const nextActions = project.nextActions.map((task) => task.title).join(", ");
  const memoryTitles = project.relatedMemories
    .map((memory) => memory.title)
    .join(", ");

  switch (action) {
    case "summarize_project":
      return {
        id: `ai_output_${Date.now()}`,
        action,
        title: `${project.name} summary`,
        content: [
          `Project: ${project.name}`,
          `Current state: ${project.currentState}`,
          `Focus: ${project.overview}`,
          `Open problems: ${openProblems || "No major problems recorded."}`,
          `Related memories: ${memoryTitles || "No linked memories yet."}`,
        ].join("\n"),
        projectId: project.id,
        projectName: project.name,
        riskLevel: actionDefinition.riskLevel,
        memoryType: "Fact",
        taskTitle: `Review ${project.name} summary`,
        taskDescription: `Review the generated project summary and decide whether it should become durable project context.`,
        createdAt: now,
      };
    case "generate_next_actions":
      return {
        id: `ai_output_${Date.now()}`,
        action,
        title: `${project.name} next actions`,
        content: [
          "Suggested next actions:",
          `1. Confirm the highest-risk blocker for ${project.name}.`,
          `2. Turn one open problem into an owner/date/action tuple.`,
          `3. Review existing next actions: ${nextActions || "none recorded yet."}`,
        ].join("\n"),
        projectId: project.id,
        projectName: project.name,
        riskLevel: actionDefinition.riskLevel,
        memoryType: "Idea",
        taskTitle: `Review generated next actions for ${project.name}`,
        taskDescription: `Review and refine the AI-generated next actions for ${project.name}.`,
        createdAt: now,
      };
    case "extract_risks":
      return {
        id: `ai_output_${Date.now()}`,
        action,
        title: `${project.name} risk extraction`,
        content: [
          "Extracted risk notes:",
          `Primary risk: ${project.risks[0]?.title ?? "No formal risk recorded."}`,
          `Problem signal: ${openProblems || "No current problems recorded."}`,
          "Recommended handling: keep this as a monitored risk until an owner and mitigation are confirmed.",
        ].join("\n"),
        projectId: project.id,
        projectName: project.name,
        riskLevel: actionDefinition.riskLevel,
        memoryType: "Risk",
        taskTitle: `Review risks for ${project.name}`,
        taskDescription: `Validate the extracted risks and decide whether any should become formal project risks.`,
        createdAt: now,
      };
    case "create_codex_prompt":
      return {
        id: `ai_output_${Date.now()}`,
        action,
        title: `${project.name} Codex prompt`,
        content: [
          `Continue WeiOS project work for ${project.name}.`,
          `Context: ${project.currentState}`,
          `Goal: address the next important project action while preserving permission-first behavior.`,
          `Use these memories as context: ${memoryTitles || "No linked memories yet."}`,
          "Return implementation changes plus verification.",
        ].join("\n"),
        projectId: project.id,
        projectName: project.name,
        riskLevel: actionDefinition.riskLevel,
        memoryType: "Idea",
        taskTitle: `Use Codex prompt for ${project.name}`,
        taskDescription: `Run or refine the generated Codex prompt for the next focused implementation pass.`,
        createdAt: now,
      };
  }
}

function projectNameFor(projectId?: string): string {
  if (!projectId) {
    return "No project";
  }

  return projects.find((project) => project.id === projectId)?.name ?? "No project";
}

function formatDate(value: string): string {
  return value.slice(0, 10);
}
