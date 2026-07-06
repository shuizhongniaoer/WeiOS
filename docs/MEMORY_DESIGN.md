# Memory Design

## Memory Types

- `long_term`: stable identity, principles, preferences, and recurring context.
- `project`: project state and history.
- `decision`: durable decisions and rationale.
- `people`: people, relationships, responsibilities, and preferences.
- `finance`: financial context and decision records.
- `health`: health context and reminders.
- `prompt`: reusable prompts and AI operating instructions.
- `experience`: lessons learned and postmortems.

## Minimum Memory Record

```ts
type Memory = {
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
};
```

## Relationship Goal

WeiOS memory should form a graph rather than a text pile. A good memory connects people, projects, decisions, risks, and next actions.

Example:

```text
Chris -> Planfit -> Australia company -> Builder API -> July launch risk
```

## MVP Summary Output

`POST /memories/summarize` should return:

- summary
- extracted facts
- extracted tasks
- extracted risks
- suggested memory items

The first implementation can use rule-based extraction. Once the contract is stable, an agent can replace the internal summarizer without changing clients.
