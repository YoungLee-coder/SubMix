---
title: Verification Checklist
impact: LOW
impactDescription: Quick reference for post-change validation
tags: reference, verification, checklist, commands
---

## Verification Checklist

**Impact: LOW (Quick reference for post-change validation)**

Run after meaningful changes:

1. `pnpm lint` — ESLint check
2. `pnpm exec tsc --noEmit` — TypeScript type check
3. `pnpm build` — for changes affecting runtime/build behavior

For API changes, also perform a quick manual request check (curl or browser) against local dev server.

Pre-commit checks are enabled via Husky + lint-staged:
- `pnpm lint` on `*.{ts,tsx,js,jsx,mjs,cjs}`
- `pnpm typecheck` on `*.{ts,tsx}`