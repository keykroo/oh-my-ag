---
name: orchestrator
description: Automated multi-agent orchestrator that spawns CLI subagents in parallel, coordinates via Serena Memory, and monitors progress
---

# Orchestrator - Automated Multi-Agent Coordinator

## Use this skill when

- Complex feature requires multiple specialized agents working in parallel
- User wants automated execution without manually spawning agents
- Full-stack implementation spanning backend, frontend, mobile, and QA
- User says "자동으로 실행해줘", "병렬로 돌려줘", or similar automation requests

## Do not use this skill when

- Simple single-domain task (use the specific agent directly)
- User wants manual control via Agent Manager UI (use workflow-guide)
- Quick bug fixes or minor changes

## Important

This skill orchestrates CLI subagents via `gemini -p "..." --yolo`. It uses Serena Memory as a shared state bus for coordination. Each subagent runs as an independent process with its own Serena MCP connection.

## Prerequisites

- Gemini CLI installed and authenticated (`gemini auth login`)
- Serena MCP configured in `.gemini/settings.json`
- Shell scripts in `scripts/` directory (`spawn-subagent.sh`, `poll-status.sh`)

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| MAX_PARALLEL | 3 | Maximum concurrent subagents (quota protection) |
| MAX_RETRIES | 2 | Retry attempts per failed task |
| POLL_INTERVAL | 30s | Status check interval |
| MAX_TURNS (backend/frontend/mobile) | 20 | Turn limit for implementation agents |
| MAX_TURNS (qa/debug) | 15 | Turn limit for review agents |
| MAX_TURNS (pm) | 10 | Turn limit for planning agent |

## Workflow

### PHASE 1: Planning

1. Analyze user request and identify required agents
2. Use PM Agent logic to decompose into tasks with priorities and dependencies
3. Generate session ID: `session-{YYYYMMDD}-{HHMMSS}`

### PHASE 2: Shared State Setup

4. Create session metadata:
   ```
   write_memory("orchestrator-session.md", session metadata with ID, timestamp, agents, task count)
   ```

5. Create task board:
   ```
   write_memory("task-board.md", all tasks in structured format)
   ```

   Task board format:
   ```markdown
   # Task Board
   ## Session: {session-id}

   ### task-1
   - **Agent**: backend
   - **Title**: JWT authentication API
   - **Status**: pending
   - **Priority**: 1
   - **Dependencies**: none
   - **Description**: ...
   - **Acceptance Criteria**: ...

   ### task-2
   ...
   ```

### PHASE 3: Parallel Subagent Execution

Process tasks by priority tier (lower number = higher priority):

6. For each task in the current priority tier:
   a. Build prompt from `resources/subagent-prompt-template.md`:
      - Insert agent role and expertise from the agent's SKILL.md
      - Insert task description and acceptance criteria from task-board
      - Insert Serena Memory protocol instructions
      - Insert turn limit and workspace path
   b. Save prompt to temporary file: `/tmp/subagent-{session}-{agent}.prompt`
   c. Execute: `scripts/spawn-subagent.sh {agent-id} {prompt-file} {session-id} {workspace}`
   d. Capture PID and record in `orchestrator-session.md`

**Constraint**: Never exceed MAX_PARALLEL concurrent agents.

### PHASE 4: Polling and Monitoring

Repeat every POLL_INTERVAL seconds:

7. Run `scripts/poll-status.sh {session-id} {agent-ids...}` to check each agent
8. For each agent, check status:
   - **running**: Read `progress-{agent}.md` for latest update, report to user
   - **completed**: Read `result-{agent}.md`, update task-board status, check if next tier is unblocked
   - **failed**: Increment retry counter, apply retry logic (see below)
   - **crashed**: Process died without result file, treat as failure
9. When all tasks in current tier complete, advance to next priority tier
10. When all tiers complete, exit polling loop

### PHASE 5: Result Collection

11. Read all `result-{agent}.md` files
12. Compile summary in `orchestrator-session.md`:
    - Total tasks: X completed, Y failed
    - Files created/modified across all agents
    - Issues encountered
13. Return final summary to user
14. Cleanup: Delete `progress-*.md` files (keep `result-*.md` for reference)

## Retry Logic

- **1st retry**: Wait 30 seconds, re-spawn with error context appended to prompt
- **2nd retry**: Wait 60 seconds, re-spawn with error context + "Try a different approach" instruction
- **Final failure**: Mark task as failed, report to user, ask whether to continue remaining tasks or abort

## Quota Protection

- MAX_PARALLEL limits concurrent agents to avoid API quota exhaustion
- Monitor subagent logs for quota error patterns (`429`, `RESOURCE_EXHAUSTED`, `rate limit`)
- On quota error: Pause all pending spawns, notify user, wait for manual resume

## Prompt Construction

When building subagent prompts, use the template at `resources/subagent-prompt-template.md` and fill in:

1. **Agent Identity**: Copy the relevant section from the agent's SKILL.md (tech stack, architecture, checklist)
2. **Task Details**: From task-board.md (title, description, acceptance criteria)
3. **Memory Protocol**: Standardized Serena Memory read/write instructions
4. **Turn Limit**: Based on agent type (see Configuration table)
5. **Workspace**: Project root or designated subdirectory

## Memory File Ownership

| File | Owner | Others |
|------|-------|--------|
| `orchestrator-session.md` | orchestrator | read-only |
| `task-board.md` | orchestrator | read-only |
| `progress-{agent}.md` | that agent | orchestrator reads |
| `result-{agent}.md` | that agent | orchestrator reads |

This ownership model prevents write conflicts between concurrent agents.

## Shell Commands Reference

```bash
# Spawn a subagent
scripts/spawn-subagent.sh {agent-id} {prompt-file} {session-id} {workspace}

# Poll all agent statuses
scripts/poll-status.sh {session-id} agent1 agent2 agent3

# Check a specific agent's log
cat /tmp/subagent-{session-id}-{agent-id}.log

# Kill a stuck agent
kill $(cat /tmp/subagent-{session-id}-{agent-id}.pid)
```

## Example Orchestration

User: "JWT 인증이 있는 TODO 앱을 만들어줘"

```
1. PM분석 → 3개 태스크 생성:
   task-1: backend (priority 1) - JWT Auth + CRUD API
   task-2: frontend (priority 1) - Login UI + Todo UI
   task-3: qa (priority 2) - Security & Performance Review

2. Priority 1 → backend + frontend 동시 실행 (2 agents)
3. 30초마다 progress 확인, 유저에게 보고
4. 둘 다 완료 → Priority 2 → qa 실행
5. qa 완료 → 전체 결과 요약 반환
```

## Error Handling

| Scenario | Action |
|----------|--------|
| Agent produces no output | Check log file, retry with extended turns |
| Agent modifies wrong files | Result review catches this, re-spawn with stricter scope |
| Serena Memory unavailable | Fall back to file-based progress tracking |
| All retries exhausted | Report failure details, let user decide next steps |
