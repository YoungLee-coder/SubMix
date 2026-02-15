# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

- Stack: Next.js App Router (`app/`), React 19, TypeScript (`strict`), Tailwind CSS v4, shadcn/ui.
- Package manager: `pnpm` (lockfile is `pnpm-lock.yaml`).
- Runtime target: Node.js + Next.js server/runtime APIs.
- Main domains:
  - UI and state management in `app/`, `components/`, `hooks/`.
  - Protocol parsing and config generation in `lib/`.
  - API routes in `app/api/**/route.ts`.

## Source of Truth for Rules

- Checked for Cursor rules:
  - `.cursorrules` (not present)
  - `.cursor/rules/` (not present)
- Checked for Copilot rules:
  - `.github/copilot-instructions.md` (not present)
- Therefore, this file is the primary agent instruction file for repo-specific behavior.

## Setup and Common Commands

- Install deps:
  - `pnpm install`
- Start local dev server:
  - `pnpm dev`
- Production build:
  - `pnpm build`
- Start production server (after build):
  - `pnpm start`
- Lint all files:
  - `pnpm lint`

## Test Status and Single-Test Guidance

- Test runner: Vitest (`vitest.config.ts`).
- Available scripts:
  - `pnpm test` (watch mode)
  - `pnpm test:run` (single CI-style run)
  - `pnpm typecheck`

Single-test command guidance:

- Vitest single file:
  - `pnpm vitest path/to/file.test.ts`
- Vitest single test name:
  - `pnpm vitest -t "test name"`
- Jest single file:
  - `pnpm jest path/to/file.test.ts`
- Jest single test name:
  - `pnpm jest -t "test name"`

Pre-commit checks are enabled via Husky + lint-staged:

- `pnpm lint`
- `pnpm typecheck`

## Linting and Type Rules

- ESLint is configured via `eslint.config.mjs` with:
  - Next.js recommended + core-web-vitals rules.
  - React hooks rules (`rules-of-hooks` error, `exhaustive-deps` warn).
- TypeScript is `strict: true` in `tsconfig.json`.
- Path alias is enabled:
  - `@/*` -> repository root.

Agent expectations:

- Do not introduce TypeScript `any` unless unavoidable; prefer explicit interfaces/types.
- Keep hooks usage valid and dependency arrays complete.
- Do not silence lint/type errors unless there is a documented reason.

## Code Style Conventions

Follow existing local file style and avoid wide reformatting-only diffs.

### Imports

- Group imports in this order unless file has a stronger existing pattern:
  1) React/Next/external packages
  2) Internal imports via `@/`
  3) Type-only imports (`import type ...`) where appropriate
- Prefer `@/` alias over long relative paths.
- Keep imports minimal; remove unused imports.

### Formatting

- Use the file's current quote/semi style; this repo currently has mixed styles.
- Preserve readable line lengths and logical spacing.
- Avoid unrelated formatting churn in touched files.
- Keep JSX className blocks readable; avoid collapsing complex class lists into one hard-to-read line.

### Types and Data Modeling

- Reuse existing domain types from `types/` and `lib/**` before creating new ones.
- For API route payloads, define request/response interfaces near route handlers.
- Use discriminated unions or literal unions for constrained values (e.g. mode/type fields).
- Validate external input before use (query params, JSON bodies).

### Naming

- React components: `PascalCase` file and symbol names.
- Hooks: `useXxx` naming, colocated in `hooks/` when shared.
- Utilities/functions/variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` only for true constants.
- Keep protocol/domain terms consistent with existing naming (`proxy`, `ruleMode`, `configType`, etc.).

### React and Next.js Patterns

- Use `"use client"` only for components/hooks that require client-side features.
- Prefer server route handlers in `app/api/**/route.ts` for conversion/parsing endpoints.
- Keep page components focused on composition; move reusable logic into hooks/components.
- Respect App Router conventions (file-based routing, route handlers, layout usage).

### Error Handling

- Validate all external input early and return clear `400` errors for invalid client requests.
- Wrap parsing/conversion logic in `try/catch` in API routes and return structured `500` errors.
- Keep user-facing messages actionable and concise.
- Avoid leaking sensitive internals in production error responses.
- Logging:
  - `console.error` for failures.
  - Development-only verbose logs gated by `process.env.NODE_ENV === "development"`.

### API Route Behavior

- Return `NextResponse.json(...)` for JSON APIs.
- For YAML/file responses, set explicit headers (`Content-Type`, cache directives, content disposition).
- Preserve current CORS behavior unless explicitly asked to change it.
- Keep response shape stable when editing existing endpoints.

### State and UX Behavior

- Keep optimistic/local state updates predictable and immutable.
- Continue using toast notifications (`sonner`) for user-visible operation results.
- Preserve existing interaction patterns (add/edit/delete/move node workflows).

## File/Change Hygiene

- Make minimal, targeted diffs.
- Do not rename/move files unless required by the task.
- Do not add large dependencies without strong justification.
- Update docs when behavior or commands change.
- If adding tests/tooling, document exact commands in this file and `README.md`.

## Verification Checklist for Agents

Run after meaningful changes:

1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm build` (for changes affecting runtime/build behavior)

For API changes, also perform a quick manual request check (curl or browser) against local dev server.

## Notes for Future Agent Updates

- If `.cursorrules`, `.cursor/rules/*`, or `.github/copilot-instructions.md` gets added later,
  merge their guidance into this file and keep conflicts explicit.
- Keep this document practical and command-accurate; prefer concrete examples over generic advice.
