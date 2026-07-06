# WeiOS Security Model

## Principle

Permission is a product feature, not an implementation detail. AI can help reason, summarize, draft, and plan, but it must not silently perform high-risk actions.

## Risk Levels

### Green

Allowed by default:

- Read project documents inside approved paths
- Read code in approved repositories
- Create local summaries
- Write drafts
- Create local tasks
- Update temporary working files

### Yellow

Requires user confirmation:

- Modify code
- Create pull requests
- Call external APIs
- Update formal documents
- Generate outbound message drafts
- Change durable project or memory state through an automation

### Red

Blocked by default:

- Send email, WeChat, or DingTalk messages
- Trade assets
- Transfer money
- Delete important files
- Modify production databases
- Access browser cookies
- Access sensitive private data without scope
- Deploy production
- Modify DNS

## Audit Log Requirements

Every AI, plugin, or automation action must record:

- actor
- action
- target
- risk level
- approval state
- timestamp
- result

## MVP Enforcement

The current skeleton includes shared risk types, permission models, audit-log models, and a placeholder risk classifier. The next implementation step is to connect every API mutation through this classifier.
