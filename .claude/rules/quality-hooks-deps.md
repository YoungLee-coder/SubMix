---
title: Hooks Dependency Arrays
impact: HIGH
impactDescription: Prevents stale data and unexpected behavior
tags: quality, react, hooks, exhaustive-deps
---

## Hooks Dependency Arrays

**Impact: HIGH (Prevents stale data and unexpected behavior)**

Keep hooks usage valid and dependency arrays complete. ESLint enforces `exhaustive-deps` as a warning. Every value used inside a hook effect/callback that could change over time must appear in the dependency array.

**Incorrect (missing dependencies):**

```typescript
useEffect(() => {
  fetchData(proxyId)
}, []) // proxyId is missing from deps
```

**Correct (complete dependency array):**

```typescript
useEffect(() => {
  fetchData(proxyId)
}, [proxyId])
```