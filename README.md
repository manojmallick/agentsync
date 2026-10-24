# agentsync

Generate and drift-check agent context files across repositories from a single JSON configuration. agentsync currently supports `AGENTS.md`, `CLAUDE.md`, `.mcp.json`, and skills README templates.

## Quick start

```bash
pnpm install
pnpm build
node dist/cli.js init
```

Edit `agentsync.config.json` to set your templates and target directories, then inspect the planned file changes:

```bash
node dist/cli.js plan
node dist/cli.js generate --dry-run
```

Apply generated files only after reviewing the plan:

```bash
node dist/cli.js generate
node dist/cli.js check --json
```

`check` exits with status 1 when managed files are missing or differ from the rendered templates.

## Configuration model

- `vars` supplies values to `{{variable}}` placeholders.
- `profiles` maps relative filenames to text templates.
- `targets` selects a profile and destination path for each repository.

Paths are resolved relative to the `--cwd` directory (the current directory by default). Review the plan and dry run before generating files; the tool does not merge edits made directly in target files.

The npm release workflow is manual and does not run on ordinary pushes.

## Development

```bash
pnpm typecheck
pnpm test
pnpm build
```

## License

Original project content is offered under the [PolyForm Noncommercial License 1.0.0](LICENSE). Third-party dependencies retain their own licenses. This is source-available software, not OSI-approved open source.
