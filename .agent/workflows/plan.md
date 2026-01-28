---
description: PM planning workflow — analyze requirements, select tech stack, decompose into prioritized tasks with dependencies, and define API contracts
---

1. Gather Requirements
   Ask the user to describe what they want to build. Clarify: target users, core features (must-have vs nice-to-have), constraints (tech stack, timeline, existing codebase), and deployment target (web, mobile, both).

2. Analyze Technical Feasibility
   // turbo
   If an existing codebase exists, scan the project structure, tech stack, and architecture patterns. Identify what can be reused and what needs to be built from scratch.

3. Define API Contracts
   // turbo
   Design the API contracts between frontend/mobile and backend. For each endpoint: method, path, request/response schemas, auth requirements, error responses. Save to `.agent/skills/_shared/api-contracts/`.

4. Decompose into Tasks
   // turbo
   Break down the project into actionable tasks. Each task must have: assigned agent (frontend/backend/mobile/qa/debug), title, acceptance criteria, priority (P0-P3), and dependencies.

5. Review Plan with User
   Present the full plan: task list, priority tiers, dependency graph, and estimated agent assignments. Ask the user to confirm or adjust before execution.

6. Save Plan
   // turbo
   Save the approved plan to `.agent/plan.json` and `.gemini/antigravity/brain/current-plan.md`. The plan is now ready for `/coordinate` or `/orchestrate` to execute.
