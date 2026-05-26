---
title: Input Validation and Security
impact: CRITICAL
impactDescription: Prevents injection, SSRF, and malformed request attacks
tags: security, validation, zod, api, cors
---

## Input Validation and Security

**Impact: CRITICAL (Prevents injection, SSRF, and malformed request attacks)**

Validate all external input early and return clear `400` errors for invalid client requests. The project has dedicated security modules (`lib/security/`) for CORS, rate limiting, and request validation. Use Zod schemas for structured validation.

**Incorrect (using raw input without validation):**

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const url = body.url // no validation — SSRF risk
  const config = await fetch(url)
  return NextResponse.json(config)
}
```

**Correct (validating with Zod and security modules):**

```typescript
import { z } from "zod"
import { validateRequest } from "@/lib/security/request-validation"

const schema = z.object({
  url: z.string().url(),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  // validateRequest handles SSRF and rate limiting
  const result = await validateRequest(parsed.data.url)
  // ...
}
```