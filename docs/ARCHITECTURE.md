# WeiOS Architecture

## System Shape

```text
apps/
  desktop-flutter/
  web-next/
services/
  api-nest/
packages/
  shared-types/
plugins/
docs/
```

## Core Layers

### Clients

- Flutter desktop is the long-term cross-platform client.
- Next.js is the fast iteration web portal and admin surface.

### API

`services/api-nest` owns the first domain boundary:

- projects
- memories
- tasks
- agents
- permissions
- audit-logs

The initial services use in-memory seed data so the shape can be tested before database wiring. Prisma is already modeled for PostgreSQL.

### Shared Types

`packages/shared-types` is the canonical contract. API, web, desktop, and plugins should import or mirror these models instead of inventing local versions.

### Storage

- PostgreSQL stores structured state.
- pgvector will support semantic memory retrieval.
- Redis supports event queues and future agent jobs.
- MinIO/NAS stores documents, meeting files, images, videos, and attachments.

## Request Flow

1. Client sends project, memory, task, or summary request.
2. API loads project and memory context.
3. Permission layer classifies risk.
4. Green actions execute directly.
5. Yellow actions create pending approvals.
6. Red actions are blocked and logged.
7. Results write back to memory, tasks, projects, and audit logs.

## AI Summary Flow

1. User pastes raw text from chat, email, meeting, or notes.
2. API classifies facts, tasks, risks, and decisions.
3. Extracted items are linked to a project when possible.
4. Suggested memory items are created for review.
5. Any external reply or destructive action waits for user confirmation.
