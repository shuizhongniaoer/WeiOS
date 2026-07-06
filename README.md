# WeiOS

Personal AI Operating System for long-term memory, project context, task orchestration, and permission-first AI workflows.

## MVP Decision

The planning document is directionally strong. My recommendation is to keep the first phase narrow:

1. Build `Project Hub + Memory Engine + AI Summary` before WeChat, DingTalk, finance sync, or complex automation.
2. Treat permissions and audit logs as core domain models from day one, not a later admin feature.
3. Use shared TypeScript models as the contract across API, web, desktop, and future plugins.
4. Start with manual import and human confirmation. Any external write action must be blocked or queued for approval.
5. Keep AI providers replaceable through agent roles and workflow steps, instead of coupling the system to one model.

## What Exists Now

- `packages/shared-types`: canonical domain models for User, Project, Memory, Task, Agent, Workflow, Permission, and AuditLog.
- `services/api-nest`: NestJS-style service skeleton with modules for projects, memories, tasks, agents, permissions, and audit logs.
- `apps/web-next`: Next.js dashboard shell for the MVP control center.
- `apps/desktop-flutter`: Flutter desktop shell for the cross-platform client.
- `docs`: PRD, architecture, security, roadmap, and memory-design notes extracted from the v0.1 planning document.
- `docker-compose.yml`: local PostgreSQL, Redis, and MinIO foundation.

## Local Bootstrap

Install JavaScript dependencies when network access is available:

```bash
pnpm install
pnpm --filter @weios/api-nest prisma:generate
pnpm --filter @weios/api-nest start:dev
pnpm --filter @weios/web-next dev
```

Run the desktop shell:

```bash
cd apps/desktop-flutter
flutter run -d macos
```

Start local infrastructure:

```bash
docker compose up -d postgres redis minio
```

## First Working Loop

1. Create or update a project.
2. Add memory items linked to that project.
3. Paste a communication summary into `POST /memories/summarize`.
4. Extract facts, tasks, risks, and suggested memory items.
5. Require explicit approval before any external write or high-risk operation.
