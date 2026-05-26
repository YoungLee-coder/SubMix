---
title: Minimal Targeted Diffs
impact: MEDIUM
impactDescription: Keeps PRs reviewable and reduces merge conflicts
tags: quality, git, diffs, code-style
---

## Minimal Targeted Diffs

**Impact: MEDIUM (Keeps PRs reviewable and reduces merge conflicts)**

Make minimal, targeted diffs. Do not rename/move files unless required by the task. Do not add large dependencies without strong justification. Avoid unrelated formatting churn in touched files.

**Incorrect (reformatting entire file while fixing one bug):**

- Changing quotes from single to double across 50 lines
- Reordering all imports when adding one new import
- Renaming variables unrelated to the fix

**Correct (changing only what's needed):**

- Add the missing import
- Fix the bug on the specific line
- Preserve surrounding code style