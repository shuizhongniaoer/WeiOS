# WeiOS Safety Guardrails For OpenClaw

This local OpenClaw skill tells OpenClaw how to behave safely around WeiOS, WeChat/DingTalk imports, local files, finance context, browser access, API keys, and automation.

It is intentionally conservative:

- manual import before automatic channel reading
- drafts before sending
- sandbox before personal folders
- confirmation before durable writes
- blocked-by-default red actions

## Suggested Install

After reviewing `SKILL.md`, install it into the WeiOS OpenClaw profile:

```bash
openclaw --profile weios skills install /Users/shangwei/Documents/理财顾问/weios/openclaw-skills/weios-safety-guardrails --as weios-safety-guardrails
```

Then check:

```bash
openclaw --profile weios skills list
openclaw --profile weios skills info weios-safety-guardrails
```

Do not connect WeChat, browser cookies, finance accounts, or API keys during this step.
