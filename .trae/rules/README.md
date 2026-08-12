# Trae Rules Mirror

This directory contains the Trae-facing rules generated from the canonical Claude setup in `.claude/rules/`.

## Rule Layout

- `core/` contains always-on project guidance derived from the Claude common rules.
- `typescript/` contains file-scoped TypeScript and JavaScript guidance.
- `playwright/` contains Playwright-focused test guidance.

## Source of Truth

- Edit `.claude/rules/**`.
- Run `pnpm sync:trae`.
- Avoid editing generated mirror files by hand.

## Mirrored Files

### TypeScript

- `coding-style.md`
- `folder-structure.md`
- `hooks.md`
- `naming.md`
- `patterns.md`
- `security.md`
- `testing.md`

### Playwright

- `assertions-and-execution.md`
- `examples-and-decisions.md`
- `naming.md`
- `page-objects-and-locators.md`
- `parallelism-and-decisions.md`
- `structure.md`
- `test-authoring.md`

