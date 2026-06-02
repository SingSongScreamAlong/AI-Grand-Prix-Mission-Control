# Project Overview

## Purpose

AI Grand Prix Mission Control is the local oversight dashboard for coordinating AI engineering work across the AI Grand Prix project.

The Windows PC runs the heavy work: AI coding sessions, simulations, tests, builds, and agent workflows.

The Mac runs this lightweight dashboard so the team can monitor status from a browser.

## Current Mission

- **Primary goal:** Maintain clear visibility into agent progress, project health, blockers, and testing/build status.
- **Operating model:** Agents report status to the dashboard through HTTP updates.
- **Storage model:** Local JSON files for now.
- **Deployment model:** Local network only.

## Project Scope

### In Scope

- Local dashboard for agent oversight
- Agent status reporting
- Project health summary
- File-based logs
- Human-readable organizational memory
- Simple Windows reporting script

### Out of Scope For Now

- Authentication
- Cloud deployment
- Docker
- Database storage
- Complex UI libraries
- Full telemetry ingestion

## Success Criteria

- The Mac dashboard shows current project health at a glance.
- Each engineering agent can report its status from the Windows PC.
- Logs preserve a basic history of updates.
- Future AI agents can understand the project by reading `/knowledge` first.

## Key Links And Paths

- **Dashboard frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3001`
- **Project root:** `/Users/conradweeden/Downloads/ai-grand-prix-mission-control`
- **Permanent project memory:** `/knowledge`
- **Runtime data:** `/data`

## How To Update This File

Update this file when the overall mission, scope, success criteria, or operating model changes.

Do not use this file for detailed task tracking. Use `roadmap.md` and `open_issues.md` for that.
