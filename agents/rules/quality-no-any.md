---
title: No TypeScript Any
impact: HIGH
impactDescription: Preserves type safety and catches bugs at compile time
tags: quality, typescript, type-safety
---

## No TypeScript Any

**Impact: HIGH (Preserves type safety and catches bugs at compile time)**

Do not introduce TypeScript `any` unless unavoidable. Prefer explicit interfaces/types. The project uses `strict: true` in `tsconfig.json`. Do not silence lint/type errors unless there is a documented reason.

**Incorrect (using any to skip typing):**

```typescript
function parseProxy(data: any): any {
  return data.nodes
}
```

**Correct (using explicit types):**

```typescript
import type { ProxyNode, ProxyData } from "@/types/proxy"

function parseProxy(data: ProxyData): ProxyNode[] {
  return data.nodes
}
```