# Trae Agents Mirror

This directory stores import-ready agent prompt files mirrored from `.claude/agents/`.

## Recommended Import Setup

- **Name**: use the file basename in Title Case.
- **Prompt**: paste the mirrored file contents.
- **Callable by other agents**: enable only when the agent is a reusable specialist.
- **Suggested built-in tools**: Read, Edit, Terminal, Preview, and Web Search only when needed.

## Mirrored Agents

- `playwright-test-generator.md` → name: Playwright Test Generator, identifier: `playwright-test-generator`
- `playwright-test-healer.md` → name: Playwright Test Healer, identifier: `playwright-test-healer`
- `playwright-test-planner.md` → name: Playwright Test Planner, identifier: `playwright-test-planner`

Edit `.claude/agents/**` and rerun `pnpm sync:trae` to refresh these import-ready files.

