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

## Data files

The app stores state in:

- `data/status.json`
- `data/agents.json`
- `data/logs.json`

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
