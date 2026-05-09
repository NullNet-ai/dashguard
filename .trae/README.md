# Trae Setup For Claude-Style Config

This project keeps its Claude-style configuration under `.claude/` and mirrors the Trae-facing surface under `.trae/`.

## One-Time Setup In Trae

1. Open the project in Trae.
2. Go to `Settings -> Rules`.
3. Enable inclusion of project-root `CLAUDE.md` and `AGENTS.md` in context.
4. Confirm Trae can see the project rules under `.trae/rules/`.

## Repo Layout

- `.claude/` is the canonical authoring surface.
- `.trae/rules/` contains Trae-native project rules.
- `.trae/skills/` mirrors `SKILL.md` workflows from `.claude/skills/`.
- `.trae/commands/` mirrors slash-command markdown from `.claude/commands/`.
- `.trae/agents/` stores import-ready agent prompts mirrored from `.claude/agents/`.

## Refresh The Mirror

Run the following command from the project root after changing supported `.claude/` files:

```bash
pnpm sync:trae
```

## Agent Import

If your Trae build does not auto-discover `.trae/agents/`, create a custom agent in Trae and paste the prompt from the mirrored file in `.trae/agents/`. Use `.trae/agents/README.md` for suggested names and identifiers.

## Command Discovery

If your Trae build does not auto-discover `.trae/commands/`, keep the files as the repo-local compatibility source and import or recreate the command content from the mirrored markdown as needed.

## Important Non-Mirrored Files

The following files are intentionally not translated into Trae rules:

- `.claude/settings.json`
- `.claude/settings.local.json`

They contain Claude-specific permissions, hooks, and plugin wiring rather than portable project rules.
