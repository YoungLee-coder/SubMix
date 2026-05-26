---
title: State and UX Patterns
impact: MEDIUM
impactDescription: Predictable interactions and consistent UX
tags: ui, react, state, ux, sonner
---

## State and UX Patterns

**Impact: MEDIUM (Predictable interactions and consistent UX)**

- Keep optimistic/local state updates predictable and immutable.
- Continue using toast notifications (`sonner`) for user-visible operation results.
- Preserve existing interaction patterns (add/edit/delete/move node workflows).
- Use discriminated unions or literal unions for constrained values (e.g., `mode`, `configType`).

**Incorrect (mutating state directly):**

```typescript
const handleUpdate = (node: ProxyNode) => {
  nodes.find(n => n.id === node.id).name = node.name
  setNodes(nodes) // mutating original array
}
```

**Correct (immutable update pattern):**

```typescript
const handleUpdate = (node: ProxyNode) => {
  setNodes(prev => prev.map(n => n.id === node.id ? node : n))
  toast.success("Node updated")
}
```