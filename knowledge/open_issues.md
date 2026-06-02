# Open Issues

This file tracks unresolved problems, risks, and questions.

## Active Issues

### Project-Level Metrics Are Mostly Manual

- **Status:** Open
- **Risk:** Medium
- **Description:** The dashboard displays build status, test status, lap times, crash rate, completion rate, branch, and commit, but only agent updates are currently automated.
- **Next step:** Add an endpoint for updating project-level metrics when needed.

### JSON Storage Is Not Designed For Heavy Concurrent Writes

- **Status:** Open
- **Risk:** Medium
- **Description:** Current file writes are simple and adequate for low-frequency agent reporting. Many agents writing rapidly at the same time could cause race conditions.
- **Next step:** Add write queueing or move to SQLite if update volume increases.

### No Authentication Or Network Hardening

- **Status:** Open
- **Risk:** Low while local-only
- **Description:** Anyone on the same reachable network could post updates if they know the endpoint.
- **Next step:** Keep the app on trusted LAN only. Add a shared token if this becomes a concern.

### Agent Freshness Not Yet Highlighted

- **Status:** Open
- **Risk:** Low
- **Description:** The dashboard shows last update times but does not visually flag stale agents.
- **Next step:** Add stale thresholds and visual warnings.

## Issue Template

### Issue Title

- **Status:** Open / In progress / Blocked / Resolved
- **Risk:** Low / Medium / High
- **Description:** What is wrong or uncertain.
- **Impact:** Why it matters.
- **Next step:** The next concrete action.
- **Owner:** Human or agent responsible, if known.
- **Date opened:** YYYY-MM-DD

## How To Update This File

Add issues when an agent finds a bug, limitation, ambiguity, or risk that should persist beyond one chat session.

Resolve issues by changing their status and adding a short resolution note. Do not delete important resolved issues immediately.
