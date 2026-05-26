---
title: API Route Conventions
impact: MEDIUM
impactDescription: Ensures stable, consistent API responses
tags: api, next.js, route-handler, response-format, cors
---

## API Route Conventions

**Impact: MEDIUM (Ensures stable, consistent API responses)**

- Return `NextResponse.json(...)` for JSON APIs.
- For YAML/file responses, set explicit headers (`Content-Type`, cache directives, content disposition).
- Preserve current CORS behavior unless explicitly asked to change it.
- Keep response shape stable when editing existing endpoints.
- For API route payloads, define request/response interfaces near route handlers.

**Incorrect (missing content-type for YAML response):**

```typescript
export async function GET() {
  const yaml = generateYaml(config)
  return new Response(yaml) // no Content-Type header
}
```

**Correct (explicit headers):**

```typescript
export async function GET() {
  const yaml = generateYaml(config)
  return new Response(yaml, {
    headers: {
      "Content-Type": "text/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": "attachment; filename=\"config.yaml\"",
    },
  })
}
```