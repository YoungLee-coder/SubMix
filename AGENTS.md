# SubMix Agent Guide

This file is the shared source of truth for any AI agent working on this repo
(Claude Code, Codex, Cursor, opencode, etc.). `CLAUDE.md` is a symlink to this
file. Put machine-specific or personal overrides in `AGENTS.local.md` /
`CLAUDE.local.md`; both are gitignored.

## Project

SubMix is a Next.js 16 web app that parses multi-protocol connection strings
(VLESS, Hysteria, Hysteria2, Shadowsocks, SS2022, Trojan) and converts them
into unified Mihomo YAML configurations for enterprise intranet traffic routing.
The one constraint that shapes work here: **the API endpoints are
security-sensitive** — they accept arbitrary connection strings and rely on
byte-limit guards, rate-limiting, and CORS controls that must never be weakened.

## Repository Map

- `app/page.tsx` — UI entry point (single-page)
- `app/layout.tsx` — Root layout with Geist font and theme
- `app/api/sub/` — Main API: parse URLs + emit YAML config (POST recommended)
- `app/api/subscription/` — CRUD for stored subscriptions; `stats/` sub-route
- `app/api/convert/` — Convert raw connection strings on the fly
- `app/api/proxy-config/` — Proxy node config operations
- `components/proxy/` — Proxy management UI (add / edit / reorder / delete nodes)
- `components/ui/` — shadcn/ui primitives (do not hand-edit generated files)
- `features/proxy/` — Feature module: proxy state and business logic
- `hooks/` — React hooks: `useConfigGeneration`, `useEditConfig`, `useProxyManagement`
- `lib/parsers/` — Per-protocol parsers: `vless`, `hysteria`, `hysteria2`, `shadowsocks`, `trojan`, `anytls`
- `lib/mihomo-config.ts` — YAML config template + generation (712 lines; owns the full Mihomo output schema — see Hotspot Ownership)
- `lib/proxy-parser.ts` — Dispatcher that routes to per-protocol parsers
- `lib/protocol-utils.ts` — Shared parsing utilities
- `lib/subscription-cache.ts` — In-memory LRU cache for subscription results
- `lib/security/` — `cors.ts`, `rate-limit.ts`, `request-validation.ts`
- `lib/http/` — `middleware.ts`, `response.ts`, `headers.ts`, `errors.ts`
- `types/proxy.ts` — Shared TypeScript types for proxy nodes
- `tests/` — Vitest unit tests (node env, `tests/**/*.test.ts`)

## Commands

```bash
pnpm dev                   # Next.js dev server (Turbopack)
pnpm build                 # Production build (Turbopack)
pnpm lint                  # ESLint
pnpm typecheck             # tsc --noEmit
pnpm test:run              # vitest run (CI / one-shot)
pnpm test                  # vitest watch

# Run a single test file:
pnpm exec vitest run tests/proxy-application.test.ts
```

Optional env vars (all have safe in-process defaults):

| Variable | Default | Purpose |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `` (same-origin) | Comma-separated CORS allowlist |
| `MAX_CACHE_ITEMS` | `500` | Max in-memory subscription cache entries |
| `MAX_CONFIG_BYTES` | `262144` | Max single config bytes |
| `MAX_SUBSCRIPTION_BODY_BYTES` | `307200` | Max POST body for `/api/subscription` |
| `MAX_SUB_REQUEST_BYTES` | `262144` | Max POST body for `/api/sub` |
| `MAX_CONVERT_REQUEST_BYTES` | `262144` | Max POST body for `/api/convert` |

## Critical Safety Rules

- Never remove or bypass byte-limit guards in `lib/security/request-validation.ts` — they are the primary DoS protection for public deployments.
- Never loosen the CORS policy in `lib/security/cors.ts` without an explicit product decision — the default same-origin-only policy is intentional.
- Never log or persist connection strings — they may contain credentials. The in-memory cache in `lib/subscription-cache.ts` is intentional.

## Working Rules

- Use `@/` for all intra-repo imports (`@/*` → repo root via `tsconfig.json` paths).
- All API routes must pass through `lib/http/middleware.ts` helpers — don't replicate validation inline.
- Add a test in `tests/` when changing parser logic in `lib/parsers/` or `lib/proxy-parser.ts`.
- TypeScript is strict — no `any`, no `@ts-ignore` without an inline comment explaining the exception.
- Commit messages use conventional style (`feat:`, `fix:`, `chore:`, etc.). No AI attribution trailers.
- lint-staged runs `pnpm lint` + `pnpm typecheck` on every commit; fix failures before committing, never skip with `--no-verify`.

## Hotspot Ownership

- `lib/mihomo-config.ts` owns the entire Mihomo YAML output contract. Intentionally large (~712 lines). Run `pnpm test:run` when touching it.
- `lib/parsers/shadowsocks.ts` — largest per-protocol parser (552 lines); changes must be covered by `pnpm test:run`

## Verification

- Parser changes (`lib/parsers/`, `lib/proxy-parser.ts`): `pnpm test:run`
- API route changes (`app/api/`): `pnpm typecheck && pnpm lint`
- Security changes (`lib/security/`): `pnpm typecheck && pnpm lint` + manually test the affected endpoint
- UI changes: `pnpm typecheck && pnpm lint`; verify visually with `pnpm dev`
- Any change: `pnpm typecheck && pnpm lint` must pass before committing

## GitHub Operations

- PRs target `master`. CI runs lint + typecheck + build on push/PR.
- Dependabot PRs auto-merge when CI passes (`.github/workflows/`).
