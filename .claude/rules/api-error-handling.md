---
title: API Error Handling
impact: HIGH
impactDescription: Provides clear, actionable feedback and prevents internal leaks
tags: api, error-handling, next.js, route-handler
---

## API Error Handling

**Impact: HIGH (Provides clear, actionable feedback and prevents internal leaks)**

Validate all external input early and return clear `400` errors. Wrap parsing/conversion logic in `try/catch` and return structured `500` errors. Keep user-facing messages actionable and concise. Never leak sensitive internals in production error responses.

**Incorrect (bare throw with internal details):**

```typescript
export async function POST(request: Request) {
  const config = generateConfig(data)
  return NextResponse.json(config)
  // No error handling — raw error with stack trace leaks to client
}
```

**Correct (structured error handling):**

```typescript
export async function POST(request: Request) {
  try {
    const config = generateConfig(data)
    return NextResponse.json(config)
  } catch (error) {
    console.error("Config generation failed:", error)
    return NextResponse.json(
      { error: "Failed to generate configuration" },
      { status: 500 }
    )
  }
}
```

Logging: `console.error` for failures. Development-only verbose logs gated by `process.env.NODE_ENV === "development"`.