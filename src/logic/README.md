# src/logic — agentsync

Source-of-truth generator + drift checker for agent context files.

| Module | Role |
|--------|------|
| `config.ts` | Load/write `agentsync.config.json` |
| `templates.ts` | Default AGENTS.md / CLAUDE.md / .mcp.json profiles |
| `render.ts` | `{{var}}` substitution |
| `plan.ts` | Plan / apply / check across targets |

## Mental model

Like Terraform for agent docs:

1. `init` — config as state
2. `plan` / `check` — drift detection
3. `generate` (`apply`) — converge leaf repos
