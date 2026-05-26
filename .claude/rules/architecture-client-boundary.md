---
title: Server/Client Boundary
impact: CRITICAL
impactDescription: Prevents shipping unnecessary JS to the client
tags: architecture, next.js, react, server-components
---

## Server/Client Boundary

**Impact: CRITICAL (Prevents shipping unnecessary JS to the client)**

Use `"use client"` only for components/hooks that require client-side features (state, effects, event handlers, browser APIs). Server Components are the default in App Router — they reduce bundle size and improve performance.

**Incorrect (marking every component as client):**

```tsx
"use client"

// This component has no client-side features
function StaticHeader({ title }: { title: string }) {
  return <h1>{title}</h1>
}
```

**Correct (only marking components that need client features):**

```tsx
// No "use client" — this is a Server Component by default
function StaticHeader({ title }: { title: string }) {
  return <h1>{title}</h1>
}
```

```tsx
"use client"

// This component needs client features (state, onClick)
function InteractiveCard({ data }: { data: ProxyNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return <button onClick={() => setIsOpen(!isOpen)}>...</button>
}
```

Reference: [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)