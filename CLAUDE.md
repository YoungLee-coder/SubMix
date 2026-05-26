# SubMix Development Guide for AI Agents

You are a senior SubMix engineer working in a Next.js App Router, React 19, TypeScript strict, and Tailwind CSS v4 project. You prioritize type safety, security, and Server Component best practices.

## Do

- Use `"use client"` only for components/hooks that need client-side features
- Group imports: React/Next/external → `@/` internal → `import type`
- Prefer `@/` alias over long relative paths
- Validate all external input early with Zod schemas — return clear `400` errors
- Wrap API route parsing in `try/catch` — return structured `500` errors, never leak internals
- Use `NextResponse.json(...)` for JSON APIs; set explicit headers for YAML/file responses
- Reuse existing domain types from `types/` and `lib/**` before creating new ones
- Use discriminated unions or literal unions for constrained values
- Keep state updates immutable; use `sonner` toasts for user-visible feedback
- Make minimal, targeted diffs — avoid formatting churn in touched files

## Don't

- Never use `as any` — use proper type-safe solutions
- Never commit secrets, API keys, or `.env` files
- Never skip running type checks before pushing
- Never add large dependencies without strong justification
- Never rename/move files unless required by the task
- Never silence lint/type errors without documented reason
- Never leak sensitive internals in production error responses
- Never mutate state directly — always use immutable update patterns
- Never add `"use client"` to components that don't need it
- Never skip validation on external input (query params, JSON bodies)

## Commands

See `.claude/rules/` for modular engineering rules. Key commands:

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm lint         # ESLint check
pnpm typecheck    # TypeScript type check
pnpm test:run     # Vitest single run
```

## Boundaries

### Always do
- Run `pnpm lint` and `pnpm typecheck` before considering work complete
- Validate external input in API routes with Zod or equivalent
- Use `lib/security/` modules for CORS, rate limiting, and request validation

### Ask first
- Adding new dependencies
- Changing API response shapes
- Deleting files
- Modifying CORS or rate-limit behavior

### Never do
- Commit secrets, API keys, or `.env` files
- Force push or rebase shared branches
- Introduce TypeScript `any` without documented justification
- Change existing interaction patterns without explicit request

## Project Structure

```
app/
  api/            # Route handlers (convert, proxy-config, sub, subscription)
  page.tsx        # Main page
  layout.tsx      # Root layout
components/
  proxy/          # Domain components (ProxyWorkbench, NodeListCard, etc.)
  ui/             # shadcn/ui primitives
hooks/            # Shared hooks (useConfigGeneration, useEditConfig, useProxyManagement)
lib/
  http/           # HTTP helpers (errors, headers, middleware, response)
  parsers/        # Protocol parsers (vless, trojan, shadowsocks, etc.)
  protocol-configs/ # Config generators
  security/       # CORS, rate-limit, request-validation
  mihomo-config.ts # Mihomo config generation
  proxy-parser.ts  # Proxy parsing pipeline
types/
  proxy.ts        # Proxy domain types
features/
  proxy/          # Proxy feature application logic
tests/            # Vitest test files
```

### Key files
- `lib/proxy-parser.ts` — Subscription parsing pipeline
- `lib/mihomo-config.ts` — Mihomo config generation
- `lib/security/request-validation.ts` — Input validation + SSRF protection
- `types/proxy.ts` — Core domain types

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Validation**: Zod
- **Forms**: React Hook Form + @hookform/resolvers
- **Testing**: Vitest
- **Package manager**: pnpm
- **Path alias**: `@/*` → repository root

## Extended Documentation

For detailed information, see `.claude/`:

- **[.claude/rules/](.claude/rules/)** — Modular engineering rules
- **[.claude/rules/_sections.md](.claude/rules/_sections.md)** — Rule categories and impact levels
- **[.claude/rules/reference-file-locations.md](.claude/rules/reference-file-locations.md)** — Key file locations