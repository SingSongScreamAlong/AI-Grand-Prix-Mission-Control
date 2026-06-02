# Roadmap

## Current Phase

### Phase 1: Local Mission Control MVP

**Status:** In progress

Core capabilities:

- Local dashboard
- Express API
- React/Vite frontend
- JSON file storage
- Agent status cards
- Windows PowerShell reporting script
- Project knowledge memory

## Near-Term Priorities

### 1. Improve Status Reporting

- Add optional build/test/lap metric update endpoint.
- Allow agents to update project-level metrics, not only agent cards.
- Add clearer blocker summaries.

### 2. Improve Dashboard Usability

- Add visual freshness indicators for stale agents.
- Add filters for blocked/high-risk agents.
- Add simple run/session labels.

### 3. Improve Reliability

- Add safer file write handling.
- Add basic backup rotation for `data/` files.
- Add validation tests for API payloads.

## Later Possibilities

### Phase 2: Better Local Operations

- Add import/export of project state.
- Add per-agent history pages.
- Add local notification sounds or visual alerts.
- Add config file for agent list and server port.

### Phase 3: Persistent Multi-Run Tracking

- Add run IDs.
- Track lap histories.
- Track simulation results over time.
- Add comparison between builds.

### Phase 4: Optional Hardening

- Add local authentication if needed.
- Add SQLite or another lightweight database if JSON files become limiting.
- Add Docker only if deployment complexity requires it.

## Explicit Non-Goals For Now

- Cloud hosting
- Multi-user account system
- Complex telemetry database
- Heavy visualization framework
- Enterprise authentication

## How To Update This File

Update this file when priorities change, a phase is completed, or new future work is accepted.

Move completed items into a short completion note instead of deleting all historical context.
