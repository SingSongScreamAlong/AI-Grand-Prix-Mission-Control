# Engineering Handoff

This document gives a new engineering workstation enough context to become productive without access to prior conversations.

## Project Summary

**AI Grand Prix Mission Control** is a local oversight dashboard for coordinating AI engineering agents working on the AI Grand Prix project.

The intended operating model is:

- A Windows PC performs heavy work: AI coding sessions, simulations, builds, and tests.
- A Mac runs this lightweight Mission Control dashboard.
- Agents running on the Windows PC send HTTP status updates to the Mac.
- The Mac dashboard displays project health, agent status, blockers, and recent logs in a browser.

The app is intentionally simple:

- Node.js
- Express backend
- React + Vite frontend
- JSON file storage
- No database
- No Docker
- No authentication
- Local network only

## Current Architecture

### Frontend

- **Framework:** React + Vite
- **Main file:** `src/main.jsx`
- **Styles:** `src/styles.css`
- **Default dev URL:** `http://localhost:5173`
- **Network behavior:** Vite runs with `--host 0.0.0.0`, allowing other devices on the same Wi-Fi network to open the dashboard.

The frontend:

- Loads `/api/status`, `/api/agents`, and `/api/logs`.
- Refreshes every 5 seconds.
- Displays the main dashboard, agent cards, and recent logs.
- Derives the API host from `window.location.hostname`, so a Windows browser opening the dashboard by Mac IP calls the Mac backend instead of Windows `localhost`.

### Backend

- **Framework:** Express
- **Main file:** `server/index.js`
- **Default API URL:** `http://localhost:3001`
- **Network behavior:** Express listens on `0.0.0.0`, allowing the Windows PC to POST updates over the local network.

The backend:

- Serves status data.
- Serves agent data.
- Receives agent updates.
- Receives project-level status metric updates.
- Appends every update to logs.
- Recalculates simple project health and completion rate after agent updates.

### Storage

Storage is file-based JSON in `data/`.

No database is currently used.

## Folder Structure

```text
ai-grand-prix-mission-control/
├── data/
│   ├── agents.json
│   ├── logs.json
│   └── status.json
├── knowledge/
│   ├── agent_roles.md
│   ├── architecture.md
│   ├── decisions.md
│   ├── open_issues.md
│   ├── project_overview.md
│   └── roadmap.md
├── server/
│   └── index.js
├── src/
│   ├── main.jsx
│   └── styles.css
├── ENGINEERING_HANDOFF.md
├── ORGANIZATION.md
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── report-agent.ps1
└── update-status.ps1
```

### Important Files

- **`README.md`**: User-facing setup, run instructions, API examples, and knowledge-system instructions.
- **`ORGANIZATION.md`**: Defines organizational roles, responsibilities, authority, inputs, outputs, and success metrics.
- **`ENGINEERING_HANDOFF.md`**: This onboarding document.
- **`report-agent.ps1`**: Windows PowerShell helper for posting agent updates to the Mac.
- **`update-status.ps1`**: Windows PowerShell helper for posting project-level metric updates to the Mac.
- **`server/index.js`**: Express API and JSON file handling.
- **`src/main.jsx`**: React dashboard UI and polling logic.
- **`src/styles.css`**: Dashboard styling.

## API Endpoints

The backend runs on port `3001` by default.

### `GET /api/status`

Returns project-level status.

Example response:

```json
{
  "overallProjectHealth": "green",
  "latestBuildStatus": "No build reported yet",
  "latestTestStatus": "No test run reported yet",
  "bestLapTime": "--",
  "averageLapTime": "--",
  "crashRate": "0%",
  "completionRate": "0%",
  "activeBranch": "unknown",
  "lastCommit": "unknown",
  "currentBlockers": [],
  "timestampOfLastUpdate": "Never"
}
```

### `GET /api/agents`

Returns all configured agents.

Current default agents:

- Perception Team
- Navigation Team
- Controls Team
- Testing Team
- Integration Team
- Technical Director
- Team Principal

### `GET /api/logs`

Returns recent update logs, newest first.

The current implementation returns the last 100 log entries.

### `POST /api/agent-update`

Updates one agent and appends the update to `data/logs.json`.

Request body:

```json
{
  "agent": "Perception Team",
  "status": "working",
  "task": "Testing gate detection",
  "note": "False positives reduced",
  "risk": "medium"
}
```

Required fields:

- `agent`
- `status`
- `task`
- `note`
- `risk`

Allowed `status` values:

- `idle`
- `working`
- `testing`
- `blocked`
- `done`

Allowed `risk` values:

- `low`
- `medium`
- `high`

Behavior:

1. Validates payload.
2. Looks up the agent by name.
3. Updates that agent in `data/agents.json`.
4. Appends a log entry to `data/logs.json`.
5. Recalculates project health and completion rate in `data/status.json`.
6. Returns the updated agent, status, and log entry.

### `POST /api/status-update`

Updates project-level dashboard metrics and appends a `status-update` entry to `data/logs.json`.

Partial updates are accepted.

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

If `lastUpdate` is omitted, the backend sets it automatically.

Example request body:

```json
{
  "projectHealth": "green",
  "buildStatus": "passing",
  "testStatus": "running",
  "bestLapTime": "8.42",
  "completionRate": "91%",
  "crashRate": "4%",
  "activeBranch": "main"
}
```

## Agent Communication Model

Agents communicate with Mission Control by sending HTTP POST requests to the Mac backend.

### Windows PowerShell Script

Use `report-agent.ps1` from Windows:

```powershell
.\report-agent.ps1 -Server "http://MAC-IP:3001" -Agent "Perception Team" -Status "working" -Task "Testing gate detection" -Note "False positives reduced" -Risk "medium"
```

Replace `MAC-IP` with the Mac's local IP address.

Example:

```powershell
.\report-agent.ps1 -Server "http://192.168.1.50:3001" -Agent "Perception Team" -Status "working" -Task "Testing gate detection" -Note "False positives reduced" -Risk "medium"
```

### Windows Status Update Script

Use `update-status.ps1` from Windows:

```powershell
.\update-status.ps1 -Server "http://MAC-IP:3001" -BuildStatus "passing" -TestStatus "running" -BestLapTime "8.42" -CompletionRate "91%" -CrashRate "4%" -ActiveBranch "main"
```

Example using the current Mac IP observed during local verification:

```powershell
.\update-status.ps1 -Server "http://192.168.68.60:3001" -BuildStatus "passing" -TestStatus "running" -BestLapTime "8.42" -CompletionRate "91%" -CrashRate "4%" -ActiveBranch "main"
```

The current observed Mac LAN URLs are:

```text
Dashboard: http://192.168.68.60:5173
API: http://192.168.68.60:3001
```

The Mac IP may change when the network changes. Recheck it with `ipconfig getifaddr en0`.

### Direct HTTP Example

```bash
curl -X POST http://192.168.1.50:3001/api/agent-update \
  -H "Content-Type: application/json" \
  -d '{"agent":"Perception Team","status":"working","task":"Testing gate detection","note":"False positives reduced","risk":"medium"}'
```

### Agent Reporting Expectations

Agents should report:

- When starting work.
- When switching tasks.
- When entering testing.
- When blocked.
- When done.
- When risk level changes.
- When a useful note should be preserved in logs.

Agent names must match known names in `data/agents.json` unless the system is updated to support new roles.

## Knowledge System

The `/knowledge` directory is the permanent project memory.

Before making changes, future AI agents should read:

1. `knowledge/project_overview.md`
2. `knowledge/architecture.md`
3. `knowledge/decisions.md`
4. `knowledge/roadmap.md`
5. `knowledge/open_issues.md`
6. `knowledge/agent_roles.md`
7. `ORGANIZATION.md`
8. `ENGINEERING_HANDOFF.md`

### Purpose Of Each Knowledge File

- **`project_overview.md`**: Mission, scope, success criteria, key paths.
- **`architecture.md`**: Components, API contract, data flow, constraints.
- **`roadmap.md`**: Current phase, near-term priorities, later possibilities.
- **`decisions.md`**: Durable product and architecture decisions.
- **`open_issues.md`**: Known risks, limitations, unresolved problems.
- **`agent_roles.md`**: Default AI Grand Prix reporting roles.
- **`ORGANIZATION.md`**: Full organizational role definitions and authority boundaries.

### How To Update Knowledge

Update knowledge files when meaningful project state changes.

Use these rules:

- Update `architecture.md` when files, APIs, ports, storage, or data flow change.
- Update `decisions.md` when major product or technical decisions are made.
- Update `roadmap.md` when priorities or phases change.
- Update `open_issues.md` when discovering or resolving persistent risks.
- Update `agent_roles.md` and `ORGANIZATION.md` when roles or responsibilities change.
- Keep runtime data in `data/`, not `knowledge/`.
- Keep long-term project memory in `knowledge/`, not `data/`.

## Mission Control Functionality

Current dashboard capabilities:

### Main Dashboard

Displays:

- Overall project health
- Latest build status
- Latest test status
- Best lap time
- Average lap time
- Crash rate
- Completion rate
- Active branch
- Last commit
- Current blockers
- Timestamp of last update

### Agent Status Cards

Displays one card for each default agent:

- Agent name
- Current status
- Current task
- Latest note
- Last update time
- Risk level

### Logs Panel

Displays recent agent updates.

### Auto Refresh

The frontend refreshes status, agents, and logs every 5 seconds.

## Roadmap

### Current Phase: Local Mission Control MVP

Completed core pieces:

- Express backend
- React/Vite frontend
- JSON file storage
- Agent status cards
- Main dashboard
- Logs panel
- PowerShell reporting script
- PowerShell status update script
- Project-level metric update endpoint
- Knowledge directory
- Organization document
- Engineering handoff document

### Near-Term Priorities

1. Push the project to GitHub.
2. Prepare DigitalOcean deployment plan.
3. Integrate the Windows PC engineering workstation using `report-agent.ps1` and `update-status.ps1`.
4. Add stale-agent visual warnings.
5. Add basic API tests.
6. Improve file write safety.
7. Add backup rotation for JSON data.
8. Add configurable agent list and ports.

### Later Possibilities

- Per-agent history pages.
- Run/session IDs.
- Simulation result tracking.
- Lap history charts.
- SQLite if JSON storage becomes limiting.
- Optional local auth token if LAN trust is not enough.

## Known Limitations

### JSON Storage Is Simple

The app uses direct JSON file reads/writes.

This is fine for low-frequency local updates but not ideal for heavy concurrent writes.

### No Authentication

Anyone who can reach the Mac backend on the LAN can post updates.

Keep the app on a trusted local network only.

### Agent List Is Static

The API only accepts agents already present in `data/agents.json`.

Adding new agents requires editing the data file and documentation.

### No Automated Test Suite Yet

The app has been manually verified, but there are no automated tests yet.

### Frontend API Base Is Simple

The frontend currently uses:

```js
import.meta.env.VITE_API_BASE || `${window.location.protocol}//${window.location.hostname}:3001`
```

This works for local Mac use and LAN browser access by Mac IP. A future deployment may still want a documented `.env` setup or unified frontend/backend origin.

## Recommended Next Steps

### 1. Push The Project To GitHub

Initialize a Git repository if needed, commit the source files, and push to a GitHub repository.

Keep these committed for now:

- `data/status.json`
- `data/agents.json`
- `data/logs.json`

Do not commit:

- `node_modules/`
- `dist/`
- `.env`
- `.DS_Store`
- npm debug logs

### 2. Prepare DigitalOcean Deployment

Plan how the Express API and Vite frontend should run on a small DigitalOcean droplet.

Keep authentication out until explicitly approved.

### 3. Integrate The Windows PC Engineering Workstation

Copy or sync these scripts to the Windows PC:

- `report-agent.ps1`
- `update-status.ps1`

Use the Mac LAN API while local:

```text
http://192.168.68.60:3001
```

### 4. Add Stale Agent Warnings

Flag agents visually when they have not updated within a configurable period.

Possible thresholds:

- 15 minutes: stale
- 30 minutes: very stale
- 60 minutes: inactive

### 5. Add Lightweight Tests

Add API tests for:

- Valid agent update
- Invalid status
- Invalid risk
- Unknown agent
- Logs append behavior
- Status recalculation behavior

### 6. Improve Data Write Safety

Add a simple write queue or atomic write helper to reduce risk of JSON corruption during near-simultaneous updates.

### 7. Expand Organization Support

`ORGANIZATION.md` defines more roles than `data/agents.json` currently contains.

If the dashboard should track every organization role, add cards for:

- Owner
- Chief Engineer
- Race Intelligence Team
- Failure Analysis Team

### 8. Keep Knowledge Current

Any workstation that changes the project should update `/knowledge` and this handoff document when the change affects future onboarding.

## How To Run

Install dependencies:

```bash
npm install
```

Start the backend and frontend:

```bash
npm run dev
```

Open on the Mac:

```text
http://localhost:5173
```

Open from another device on the same Wi-Fi:

```text
http://MAC-IP:5173
```

Send updates to:

```text
http://MAC-IP:3001/api/agent-update
```

## Handoff Status

The MVP is functional and locally verified.

The next team should begin by reading the knowledge system, running the app, confirming LAN access, and addressing the frontend API host issue for non-Mac browsers.
