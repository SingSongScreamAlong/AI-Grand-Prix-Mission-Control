# Architecture

## System Summary

AI Grand Prix Mission Control is a local web application with a small Express API, a React/Vite frontend, and JSON file storage.

## Components

### Frontend

- **Framework:** React + Vite
- **Location:** `src/`
- **Entry point:** `src/main.jsx`
- **Styles:** `src/styles.css`
- **Default URL:** `http://localhost:5173`
- **Network access:** Vite runs with `--host 0.0.0.0`

### Backend

- **Framework:** Express
- **Location:** `server/index.js`
- **Default URL:** `http://localhost:3001`
- **Network access:** Express listens on `0.0.0.0`

### Storage

- **Type:** File-based JSON
- **Location:** `data/`
- **Files:**
  - `data/status.json`
  - `data/agents.json`
  - `data/logs.json`

### Windows Reporting Script

- **Script:** `report-agent.ps1`
- **Purpose:** Send agent updates from the Windows PC to the Mac API.
- **Endpoint:** `/api/agent-update`

### Windows Status Update Script

- **Script:** `update-status.ps1`
- **Purpose:** Send project-level metric updates from the Windows PC to the Mac API.
- **Endpoint:** `/api/status-update`

## API Contract

### `GET /api/status`

Returns current project-level dashboard status.

### `GET /api/agents`

Returns all configured agent cards.

### `GET /api/logs`

Returns recent logs, newest first.

### `POST /api/agent-update`

Accepts:

```json
{
  "agent": "Perception Team",
  "status": "working",
  "task": "Testing gate detection",
  "note": "False positives reduced",
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

### `POST /api/status-update`

Accepts partial project-level metric updates:

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

## Data Flow

1. A Windows agent runs `report-agent.ps1` or sends a direct HTTP POST.
2. Express receives the update at `/api/agent-update`.
3. The backend validates the agent, status, and risk.
4. The backend updates `data/agents.json`.
5. The backend recalculates basic status and updates `data/status.json`.
6. The backend appends the update to `data/logs.json`.
7. The React dashboard refreshes every 5 seconds and displays the latest state.

Status updates follow the same storage pattern but update `data/status.json` directly and append a log entry with type `status-update`.

## Current Constraints

- No authentication.
- No database.
- No Docker.
- Local network trust model only.
- JSON writes are simple file writes, not a high-concurrency storage layer.

## How To Update This File

Update this file when APIs, ports, data flow, file layout, storage behavior, or major implementation choices change.
