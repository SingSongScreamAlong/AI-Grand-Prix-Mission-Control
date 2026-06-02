# Agent Roles

This file defines the default AI Grand Prix organization.

## Reporting Rules For All Agents

Each agent should report:

- **Agent name:** Must match one of the names below.
- **Status:** `idle`, `working`, `testing`, `blocked`, or `done`.
- **Current task:** Short description of what the agent is doing.
- **Latest note:** Useful detail for the human operator or other agents.
- **Risk:** `low`, `medium`, or `high`.

Agents should send updates through `POST /api/agent-update` or `report-agent.ps1`.

## Roles

### Perception Team

- **Mission:** Detect and interpret track objects, gates, cones, boundaries, and visual signals.
- **Typical work:** Vision pipeline, detection tests, false-positive reduction, sensor interpretation.
- **Common risks:** Misclassification, poor lighting robustness, stale training assumptions.

### Navigation Team

- **Mission:** Convert perception and map data into safe, fast racing lines.
- **Typical work:** Path planning, racing line optimization, obstacle avoidance, route validation.
- **Common risks:** Unstable paths, over-aggressive turns, poor recovery behavior.

### Controls Team

- **Mission:** Convert navigation intent into throttle, brake, steering, and stability behavior.
- **Typical work:** Controller tuning, lap stability, braking zones, corner exit behavior.
- **Common risks:** Oscillation, understeer/oversteer, poor response to noisy inputs.

### Testing Team

- **Mission:** Validate system behavior through tests, simulations, and regression checks.
- **Typical work:** Smoke tests, regression tests, simulation runs, failure reproduction.
- **Common risks:** Incomplete coverage, flaky tests, untracked failures.

### Integration Team

- **Mission:** Connect subsystems into a working end-to-end AI Grand Prix stack.
- **Typical work:** Interface contracts, merge coordination, build checks, dependency alignment.
- **Common risks:** Schema mismatch, broken integration, incompatible assumptions between teams.

### Technical Director

- **Mission:** Make technical tradeoff decisions and keep engineering priorities coherent.
- **Typical work:** Architecture review, performance priorities, risk management, acceptance criteria.
- **Common risks:** Optimizing lap time before reliability, unclear technical direction.

### Team Principal

- **Mission:** Coordinate the organization and maintain project-level focus.
- **Typical work:** Sprint direction, blocker escalation, priority calls, readiness checks.
- **Common risks:** Too many simultaneous goals, unresolved blockers, unclear ownership.

## Adding A New Agent Role

When adding a new role:

1. Add it to this file.
2. Add it to `data/agents.json`.
3. Update README examples if needed.
4. Verify `POST /api/agent-update` accepts the new exact agent name.

## How To Update This File

Update this file when team responsibilities change or new agent roles are added.

Keep role names stable unless there is a strong reason to rename them.
