---
title: Import Grouping Order
impact: MEDIUM
impactDescription: Reduces cognitive load when reading imports
tags: architecture, imports, code-style
---

## Import Grouping Order

**Impact: MEDIUM (Reduces cognitive load when reading imports)**

Group imports in this order unless the file has a stronger existing pattern:
1. React/Next/external packages
2. Internal imports via `@/` alias
3. Type-only imports (`import type ...`)

**Incorrect (mixed, disorganized imports):**

```typescript
import type { ProxyNode } from "@/types/proxy"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

**Correct (grouped by category):**

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProxyNode } from "@/types/proxy"
```

Prefer `@/` alias over long relative paths. Keep imports minimal — remove unused imports.