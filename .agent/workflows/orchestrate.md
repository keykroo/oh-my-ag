---
description: Automated CLI-based parallel agent execution — spawn subagents via Gemini CLI, coordinate through Serena Memory, monitor progress, and run verification
---

1. Load or Create Plan
   Check if `.agent/plan.json` exists. If yes, load it. If not, ask the user to run `/plan` first or describe the tasks to execute.

2. Initialize Session
   // turbo
   Generate a session ID (format: `session-YYYYMMDD-HHMMSS`). Write `orchestrator-session.md` and `task-board.md` to `.serena/memories/`. Set session status to RUNNING.

3. Spawn Agents by Priority Tier
   // turbo
   For each priority tier (P0 first, then P1, etc.):
   - Spawn agents using `gemini -p "{prompt}" --yolo` (max 3 parallel)
   - Each agent gets: task description, API contracts, relevant context from `_shared/context-loading.md`
   - Update `task-board.md` with agent status

4. Monitor Progress
   Poll `.serena/memories/progress-{agent}.md` every 30 seconds. Update `task-board.md` with turn counts and status changes. Watch for: completion, failures, crashes (no update for 5 minutes).

5. Verify Completed Agents
   // turbo
   For each completed agent, run automated verification:
   ```
   bash .agent/skills/_shared/verify.sh {agent-type} {workspace}
   ```
   PASS (exit 0): Accept result. FAIL (exit 1): Re-spawn with error context (max 2 retries).

6. Collect Results
   // turbo
   After all agents complete, read all `result-{agent}.md` files. Compile a summary with: completed tasks, failed tasks, files changed, and any remaining issues.

7. Final Report
   Present the session summary to the user. If any tasks failed after retries, list them with error details. Suggest next steps: manual fix, re-run specific agents, or run `/review` for QA.
