---
title: Key File Locations
impact: LOW
impactDescription: Quick navigation to important files
tags: reference, navigation, file-locations
---

## Key File Locations

**Impact: LOW (Quick navigation to important files)**

### Entry

- `app/page.tsx` — Main page (SSR entry)
- `app/layout.tsx` — Root layout

### Business Logic

- `lib/mihomo-config.ts` — Mihomo config generation
- `lib/proxy-parser.ts` — Proxy parsing pipeline
- `lib/protocol-utils.ts` — Protocol utility functions
- `lib/parsers/` — Protocol-specific parsers (vless, trojan, shadowsocks, hysteria, hysteria2, anytls)
- `lib/protocol-configs/` — Protocol config generators
- `lib/subscription-cache.ts` — Subscription caching

### HTTP & Security

- `lib/http/` — HTTP helpers (errors, headers, middleware, response)
- `lib/security/` — CORS, rate limiting, request validation

### API Routes

- `app/api/convert/` — Protocol conversion endpoint
- `app/api/proxy-config/` — Proxy config endpoint
- `app/api/sub/` — Subscription download
- `app/api/subscription/` — Subscription management

### UI & State

- `components/proxy/` — Proxy domain components (ProxyWorkbench, NodeListCard, etc.)
- `components/ui/` — shadcn/ui primitives
- `hooks/` — Shared hooks (useConfigGeneration, useEditConfig, useProxyManagement)
- `features/proxy/application/` — Proxy feature application logic

### Types

- `types/proxy.ts` — Proxy domain types