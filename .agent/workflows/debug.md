---
description: Structured bug diagnosis and fixing workflow — reproduce, diagnose root cause, apply minimal fix, write regression test, and scan for similar patterns
---

1. Collect Error Information
   Ask the user for: error message, steps to reproduce, expected vs actual behavior, environment (browser, OS, device). If an error message is provided, proceed immediately.

2. Reproduce the Bug
   // turbo
   Search the codebase for the error location using stack trace or error message. Identify the exact file and line. If no stack trace, use `find_symbol` or `search_for_pattern` to locate the relevant code.

3. Diagnose Root Cause
   Trace the execution path from the error point backward. Identify the root cause — not just the symptom. Check: null/undefined access, race conditions, missing error handling, wrong data types, stale state.

4. Propose Minimal Fix
   Present the root cause and proposed fix to the user. The fix should change only what is necessary. Explain why this fixes the root cause, not just the symptom.

5. Apply Fix and Write Regression Test
   // turbo
   Implement the minimal fix. Write a regression test that reproduces the original bug and verifies the fix. The test must fail without the fix and pass with it.

6. Scan for Similar Patterns
   // turbo
   Search the codebase for the same pattern that caused the bug. Report any other locations that may have the same vulnerability. Fix them if confirmed.

7. Document the Bug
   Save a bug report to `.gemini/antigravity/brain/bugs/` with: symptom, root cause, fix applied, files changed, regression test location, similar patterns found.
