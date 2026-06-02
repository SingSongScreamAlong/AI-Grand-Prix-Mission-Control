# AI Grand Prix Mission Control

A simple local oversight dashboard for monitoring AI Grand Prix engineering agents from a browser on your Mac.

## Stack

- Node.js
- Express backend
- React + Vite frontend
- File-based JSON storage
- No database
- No Docker
- No authentication

## Install dependencies

From this folder:

```bash
npm install
```

## Run the app on Mac

```bash
npm run dev
```

This starts:

- Backend API: `http://localhost:3001`
- Frontend dashboard: `http://localhost:5173`

The frontend is started with `--host 0.0.0.0`, so another computer on the same Wi-Fi network can reach it by using your Mac's local IP address.

## Find your Mac's local IP address

Use either method:

```bash
ipconfig getifaddr en0
```

If you are using Ethernet instead of Wi-Fi:

```bash
ipconfig getifaddr en1
```

You can also check:

```bash
ifconfig | grep "inet "
```

Look for an address like `192.168.x.x` or `10.0.x.x`.

## Open from the Windows PC

If your Mac IP is `192.168.1.50`, open this on the Windows PC:

```text
http://192.168.1.50:5173
```

The Windows PC can send API updates to:

```text
http://192.168.1.50:3001/api/agent-update
```

## API endpoints

### GET `/api/status`

Returns the current project dashboard status.

### GET `/api/agents`

Returns all agent cards.

### GET `/api/logs`

Returns recent update logs.

### GET `/api/executive-summary`

Returns the Team Principal home-page summary:

- Project Health
- Current Bottleneck
- Team Consensus
- Top Risks
- Recommended Action
- Pending Decisions

### GET `/api/directives`

Returns all directives, newest first.

### GET `/api/directives/current`

Returns the most recent active directive.

### POST `/api/directive`

Creates a Team Principal directive.

### PATCH `/api/directive/:id`

Updates directive status.

### POST `/api/command-directive`

Converts a Team Principal free-text command into a directive and creates it automatically.

Required JSON body:

```json
{
  "prompt": "Achieve first completed lap.",
  "autonomyLevel": 1
}
```

Autonomy levels:

- `0`: manual directives only
- `1`: prompt-to-directive generation

If `OPENAI_API_KEY` is configured, Mission Control uses the LLM helper. If it is not configured, it uses a deterministic local fallback so the command bar still works.

### Adaptive organization endpoints

Mission Control now tracks organizational learning so failed cycles can become blockers and remediation work instead of repeated scheduler loops.

#### POST `/api/adaptive-task-update`

Records task outcomes from an agent runner or autonomous loop.

```json
{
  "agent": "Testing Team",
  "task": "Investigate gate 1 failure",
  "outcome": "failed",
  "note": "Same failure reproduced",
  "rootCause": "Gate detector threshold is unstable",
  "linkedDirectiveId": "optional-directive-id",
  "linkedFindingId": "optional-finding-id"
}
```

Accepted field aliases:

- Agent: `agent` or `agentName`
- Task: `task`, `taskKey`, or `taskName`
- Outcome: `outcome`, `classification`, `result`, or `status`
- Evidence: `note`, `evidence`, or `evidenceExcerpt`
- Recommendation: `recommendation` or `recommendedNextAction`
- Optional links: `linkedDirectiveId`, `linkedFindingId`

Autonomous-loop compatible example:

```json
{
  "agentName": "Testing Team",
  "taskName": "Investigate gate 1 failure",
  "classification": "failed",
  "rootCause": "Gate detector threshold is unstable",
  "evidenceExcerpt": "Same failure reproduced twice",
  "recommendedNextAction": "Create threshold calibration remediation task"
}
```

Repeated failures are converted into:

- Failure memory
- Open blockers
- Remediation tasks
- Suppressed repeated task recommendations

#### GET `/api/adaptive-next-task`

Returns the next adaptive organization task, prioritizing remediation and blockers over repeating known failed work.

#### POST `/api/git-findings`

Classifies dirty repository changes from agent workstations.

```json
{
  "agent": "Integration Team",
  "changes": [
    { "path": "src/main.jsx", "status": "modified" },
    { "path": "data/logs.json", "status": "modified" }
  ],
  "note": "Post-cycle repository scan"
}
```

Accepted field aliases:

- Agent: `agent` or `agentName`
- Changes: `changes`, `changedFiles`, or `classifications`
- Change path: string entries, or object fields `path`, `file`, `filePath`, or `name`
- Change classification: `classification`, `type`, or `category`
- Evidence: `note`, `evidence`, or `evidenceExcerpt`
- Recommendation: `recommendation` or `recommendedNextAction`

Autonomous-loop compatible examples:

```json
{
  "agentName": "Integration Team",
  "changedFiles": [
    "src/main.jsx",
    "data/logs.json",
    "dist/assets/index.js"
  ],
  "evidenceExcerpt": "Repository dirty after cycle",
  "recommendedNextAction": "Review source changes and discard log artifacts"
}
```

```json
{
  "agentName": "Integration Team",
  "classifications": {
    "src/main.jsx": "source changes",
    "data/logs.json": "logs"
  }
}
```

Classifications:

- Source changes
- Generated files
- Logs
- Reports
- Unknown files

#### GET endpoints

```text
GET /api/failures
GET /api/blockers
GET /api/remediation-tasks
GET /api/git-findings
```

### Autonomy roadmap

Current state:

- Level 0: manual directives only.
- Level 1: Team Principal prompt-to-directive generation.

Level 2 design:

- Agent runner reports task outcomes to `/api/adaptive-task-update`.
- Repeated failed tasks are suppressed.
- Mission Control generates blockers and remediation tasks.
- `/api/adaptive-next-task` becomes the runner's next-task source.

Level 3 design:

- Agents propose remediation plans and implementation diffs.
- Mission Control classifies git changes and summarizes risk.
- Team Principal approves or rejects recommended fixes before merge/deploy.

Level 4 design:

- Mission Control autonomously sequences remediation, validation, and rollout.
- Human approval is reserved for high-risk changes, critical blockers, and deployment.
- Organizational health and confidence thresholds gate autonomous action.

Recommended implementation order:

1. Wire Agent Runner cycle reporting into `/api/adaptive-task-update`.
2. Wire next-cycle selection to `/api/adaptive-next-task`.
3. Add workstation git scan reporting to `/api/git-findings`.
4. Add Team Principal approval controls for remediation tasks.
5. Add deployment gates based on organizational health and confidence.

### POST `/api/agent-update`

Updates one agent and appends an entry to `data/logs.json`.

Required JSON body:

```json
{
  "agent": "Perception Team",
  "status": "working",
  "task": "Testing gate detection",
  "note": "False positives reduced in latest run",
  "risk": "medium"
}
```

Allowed statuses:

- `idle`
- `working`
- `testing`
- `blocked`
- `done`

Allowed risk levels:

- `low`
- `medium`
- `high`

### POST `/api/status-update`

Updates project-level dashboard metrics and appends an entry to `data/logs.json` with type `status-update`.

Partial updates are accepted. You only need to send the fields you want to change.

Allowed fields:

- `projectHealth`
- `buildStatus`
- `testStatus`
- `bestLapTime`
- `averageLapTime`
- `crashRate`
- `completionRate`
- `activeBranch`
- `lastCommit`
- `currentBlockers`
- `lastUpdate`

If `lastUpdate` is not provided, the server sets it automatically.

## Example curl command

Replace `192.168.1.50` with your Mac's local IP address:

```bash
curl -X POST http://192.168.1.50:3001/api/agent-update \
  -H "Content-Type: application/json" \
  -d '{"agent":"Perception Team","status":"working","task":"Testing gate detection","note":"False positives reduced in latest run","risk":"medium"}'
```

## Example status update curl command from Mac

```bash
curl -X POST http://localhost:3001/api/status-update \
  -H "Content-Type: application/json" \
  -d '{"projectHealth":"green","buildStatus":"passing","testStatus":"running","bestLapTime":"8.42","completionRate":"91%","crashRate":"4%","activeBranch":"main"}'
```

## Example PowerShell command from Windows

Replace `192.168.1.50` with your Mac's local IP address:

```powershell
$body = @{
  agent = "Perception Team"
  status = "working"
  task = "Testing gate detection"
  note = "False positives reduced in latest run"
  risk = "medium"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://192.168.1.50:3001/api/agent-update" `
  -ContentType "application/json" `
  -Body $body
```

## Example status update PowerShell command from Windows

Replace `192.168.1.50` with your Mac's local IP address:

```powershell
$body = @{
  projectHealth = "green"
  buildStatus = "passing"
  testStatus = "running"
  bestLapTime = "8.42"
  completionRate = "91%"
  crashRate = "4%"
  activeBranch = "main"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://192.168.1.50:3001/api/status-update" `
  -ContentType "application/json" `
  -Body $body
```

## Windows reporting script

Copy `report-agent.ps1` to the Windows PC, or run it from this project folder if the folder is shared.

The script posts to:

```text
/api/agent-update
```

Use your Mac's backend API address for `-Server`. For this app, the backend runs on port `3001`.

Basic example:

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Perception Team" -Status "working" -Task "Testing gate detection" -Note "False positives reduced" -Risk "medium"
```

### Per-agent examples

**Perception Team**

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Perception Team" -Status "working" -Task "Testing gate detection" -Note "False positives reduced" -Risk "medium"
```

**Navigation Team**

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Navigation Team" -Status "testing" -Task "Validating racing line planner" -Note "New path smoothing pass is under test" -Risk "medium"
```

**Controls Team**

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Controls Team" -Status "working" -Task "Tuning throttle and braking controller" -Note "Oscillation reduced on corner exit" -Risk "low"
```

**Testing Team**

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Testing Team" -Status "testing" -Task "Running regression suite" -Note "Smoke tests passing, endurance run pending" -Risk "low"
```

**Integration Team**

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Integration Team" -Status "blocked" -Task "Merging perception output with navigation input" -Note "Waiting on stable cone classification schema" -Risk "high"
```

**Technical Director**

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Technical Director" -Status "working" -Task "Reviewing system performance" -Note "Prioritizing crash-rate reduction before lap-time gains" -Risk "medium"
```

**Team Principal**

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Team Principal" -Status "working" -Task "Coordinating sprint priorities" -Note "Focus remains clean completion before aggressive optimization" -Risk "low"
```

## Windows status update script

Copy `update-status.ps1` to the Windows PC, or run it from this project folder if the folder is shared.

Basic example:

```powershell
.\update-status.ps1 -Server "http://192.168.1.50:3001" -BuildStatus "passing" -TestStatus "running" -BestLapTime "8.42" -CompletionRate "91%" -CrashRate "4%" -ActiveBranch "main"
```

## Windows directive workflow

PC engineering terminals should pull orders from Mission Control instead of relying on raw terminal output.

Fetch the current active order:

```powershell
.\get-directives.ps1 -Server "http://157.245.132.229:3001"
```

Acknowledge an order:

```powershell
.\acknowledge-directive.ps1 -Server "http://157.245.132.229:3001" -DirectiveId "DIRECTIVE_ID"
```

Report completion with the existing reporting script:

```powershell
.\report-agent.ps1 -Server "http://157.245.132.229:3001" -Agent "Integration Team" -Status "done" -Task "Completed directive DIRECTIVE_ID" -Note "Success criteria met and ready for Team Principal review" -Risk "low"
```

## Data files

The app stores state in:

- `data/status.json`
- `data/agents.json`
- `data/logs.json`
- `data/directives.json`
- `data/acknowledgements.json`
- `data/findings.json`
- `data/recommendations.json`
- `data/failures.json`
- `data/blockers.json`
- `data/remediation-tasks.json`
- `data/git-findings.json`

Every `POST /api/agent-update` writes to `agents.json`, recalculates basic project health in `status.json`, and appends to `logs.json`.

Every `POST /api/status-update` merges project metrics into `status.json` and appends a `status-update` entry to `logs.json`.

## Project knowledge memory

The `/knowledge` directory is the permanent memory of the AI Grand Prix Mission Control organization.

Future AI agents should read these files before making changes:

- `knowledge/project_overview.md`
- `knowledge/architecture.md`
- `knowledge/roadmap.md`
- `knowledge/decisions.md`
- `knowledge/open_issues.md`
- `knowledge/agent_roles.md`

### How AI agents should use `/knowledge`

Before starting development:

1. Read `project_overview.md` to understand the mission and scope.
2. Read `architecture.md` to understand the current implementation and data flow.
3. Read `decisions.md` to avoid reversing important choices by accident.
4. Read `roadmap.md` and `open_issues.md` to understand current priorities and known risks.
5. Read `agent_roles.md` before changing agent names, responsibilities, or reporting behavior.

During development:

1. Keep changes aligned with the documented scope and decisions.
2. Add new issues to `open_issues.md` when unresolved bugs, risks, or questions are discovered.
3. Add new decisions to `decisions.md` when architecture, storage, deployment, workflow, or scope changes.
4. Update `architecture.md` when APIs, ports, files, data flow, or major components change.
5. Update `roadmap.md` when phases, priorities, or future work change.
6. Update `agent_roles.md` when agent responsibilities or valid agent names change.

After development:

1. Record meaningful completed work in the relevant knowledge file.
2. Do not delete important historical decisions or resolved issues without a reason.
3. Keep the files concise, factual, and useful for the next agent.

These files are not runtime data. Runtime dashboard state belongs in `/data`. Long-term organizational memory belongs in `/knowledge`.

## Notes

- Keep your Mac and Windows PC on the same Wi-Fi network.
- If Windows cannot reach the Mac, check the macOS firewall settings.
- This app is intentionally local and simple. There is no login, cloud service, database, or Docker setup.
