# Decisions

This file records architectural and product decisions that future agents should preserve unless explicitly changed.

## Active Decisions

### Use Local-Only Deployment

- **Decision:** Run Mission Control locally on the Mac and expose it only on the local Wi-Fi network.
- **Reason:** The Mac is the lightweight command center. The Windows PC sends updates over the LAN.
- **Implication:** No cloud hosting is required.

### Use JSON File Storage For Now

- **Decision:** Store runtime state in `data/status.json`, `data/agents.json`, and `data/logs.json`.
- **Reason:** Simple, inspectable, and enough for the MVP.
- **Implication:** Avoid adding a database unless project needs exceed simple JSON storage.

### Keep The UI Simple

- **Decision:** Use plain React and CSS without heavy UI libraries.
- **Reason:** The dashboard should be fast, readable, and easy to modify.
- **Implication:** Do not add component libraries unless there is a strong reason.

### No Authentication Yet

- **Decision:** Do not add login or user accounts yet.
- **Reason:** The app is intended for local trusted network use.
- **Implication:** Do not expose this app directly to the public internet.

### Seven Default Agent Roles

- **Decision:** The default organization has seven agent roles:
  - Perception Team
  - Navigation Team
  - Controls Team
  - Testing Team
  - Integration Team
  - Technical Director
  - Team Principal
- **Reason:** These roles map cleanly to AI Grand Prix engineering oversight.
- **Implication:** Keep these names stable because the API validates known agents.

## Decision Template

### Decision Title

- **Decision:** What was decided.
- **Reason:** Why it was chosen.
- **Alternatives considered:** Other options that were rejected.
- **Implication:** What future agents must preserve or account for.
- **Date:** YYYY-MM-DD

## How To Update This File

Add a decision when a change affects architecture, scope, workflow, storage, deployment, or long-term maintenance.

Do not silently reverse a decision. Add a new decision explaining the change.
