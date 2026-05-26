---
title: App Router Conventions
impact: HIGH
impactDescription: Ensures consistent routing and server-side patterns
tags: architecture, next.js, app-router, route-handlers
---

## App Router Conventions

**Impact: HIGH (Ensures consistent routing and server-side patterns)**

Respect App Router conventions: file-based routing, route handlers, and layout usage. Prefer server route handlers in `app/api/**/route.ts` for conversion/parsing endpoints. Keep page components focused on composition — move reusable logic into hooks/components.

**Incorrect (mixing data fetching logic in page components):**

```tsx
// page.tsx with heavy data processing inline
export default function Page() {
  const rawData = fetch(...)
  const parsed = parseProtocol(rawData) // heavy parsing in page
  return <Workbench data={parsed} />
}
```

**Correct (using API routes for heavy processing, pages for composition):**

```tsx
// app/api/convert/route.ts handles parsing
// page.tsx only composes UI
export default function Page() {
  return <ProxyWorkbench />
}
```