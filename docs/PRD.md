# WeiOS PRD v0.1

## Positioning

WeiOS is a personal AI operating system. It unifies long-term memory, project context, tasks, communication summaries, finance assistance, knowledge management, automation, and AI tools around one person.

The first version must avoid becoming a broad integration project. Its job is to prove the core brain:

- Project Hub
- Memory Engine
- AI Summary
- permission-first action control

## Target User

The first user is the system owner. The product should optimize for personal continuity across many projects, tools, messages, and decisions.

## MVP Scope

Included:

- Identity profile
- Project Hub
- Memory Engine
- Task Engine
- AI Team role registry
- Permission and audit framework
- Manual communication import
- Memory summary API

Excluded for MVP:

- Automatic WeChat or DingTalk reading
- Automatic message sending
- Automatic trading or money movement
- Complex finance synchronization
- Production deployment automation

## MVP Pages

- Dashboard: top 3 priorities, project state, risks, recent memories, AI suggestions, pending approvals.
- Projects: project list, status, priority, recent progress, next actions, risks.
- Memories: search, tags, project links, people links, decision records, summaries.
- Tasks: source-aware task list with project links and priority.
- AI Team: agent roles, providers, model settings, execution history.
- Permissions: scopes, pending approvals, audit log, high-risk blocks.
- Settings: providers, local paths, storage, import preferences.

## Success Criteria

- A project can collect memories, tasks, risks, and next actions in one place.
- A pasted communication summary can produce extracted facts, tasks, risks, and suggested memory items.
- Every AI or plugin action can be classified as green, yellow, or red.
- Red actions are blocked by default.
- Yellow actions require explicit user approval and generate audit logs.
