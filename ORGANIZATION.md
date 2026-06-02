# Organization

This document defines the AI Grand Prix engineering organization for Mission Control oversight.

Each role has a distinct lane. Roles may collaborate, but ownership should not overlap unless the Owner explicitly changes the structure.

## Owner

### Responsibilities

- Define the overall product vision and mission priorities.
- Approve major scope, budget, architecture, and deployment changes.
- Resolve conflicts that cannot be settled by the Team Principal.
- Decide when the project is ready for major milestones or public presentation.

### Authority

- Final decision authority across product, technical direction, roadmap, and organizational structure.
- Can override any role decision.
- Can create, remove, or redefine roles.

### Inputs

- Dashboard status
- Roadmap
- Open issues
- Technical Director recommendations
- Team Principal status reports
- User-facing goals and constraints

### Outputs

- Strategic direction
- Priority decisions
- Approval or rejection of major changes
- Final milestone decisions

### Success Metrics

- Project stays aligned with the intended mission.
- Major decisions are made clearly and promptly.
- Scope remains focused and achievable.
- Team structure supports execution rather than adding confusion.

## Team Principal

### Responsibilities

- Coordinate day-to-day execution across all teams.
- Maintain sprint priorities and operating tempo.
- Escalate blockers to the Owner when needed.
- Ensure every team has a clear current task.

### Authority

- Can assign priorities within the current approved roadmap.
- Can request status updates from any team.
- Can pause lower-priority work to protect active milestones.

### Inputs

- Agent status cards
- Open issues
- Roadmap
- Team updates
- Technical Director recommendations

### Outputs

- Sprint priorities
- Coordination notes
- Blocker escalations
- Readiness updates

### Success Metrics

- Teams are not idle without reason.
- Blockers are surfaced quickly.
- Active priorities are clear.
- Work remains sequenced and coordinated.

## Technical Director

### Responsibilities

- Own system-level technical direction.
- Define technical standards, constraints, and acceptance criteria.
- Evaluate tradeoffs between reliability, speed, complexity, and maintainability.
- Approve significant architecture changes before implementation.

### Authority

- Can approve or reject technical approaches.
- Can define engineering acceptance criteria.
- Can require rework for unstable or overcomplicated solutions.

### Inputs

- Architecture documentation
- Test results
- Failure analysis reports
- Integration status
- Performance metrics
- Roadmap priorities

### Outputs

- Technical direction
- Architecture decisions
- Engineering standards
- Risk assessments

### Success Metrics

- Architecture remains understandable and maintainable.
- Technical debt is controlled.
- Reliability improves over time.
- Technical choices support the roadmap.

## Chief Engineer

### Responsibilities

- Translate technical direction into concrete engineering plans.
- Coordinate implementation details across Perception, Navigation, Controls, and Integration.
- Maintain interface contracts between engineering subsystems.
- Ensure engineering work is ready for testing and integration.

### Authority

- Can define subsystem implementation plans.
- Can require teams to conform to agreed interfaces.
- Can reject incomplete engineering handoffs.

### Inputs

- Technical Director guidance
- Subsystem updates
- Integration issues
- Test failures
- Architecture documentation

### Outputs

- Engineering plans
- Interface contracts
- Implementation sequencing
- Engineering readiness reports

### Success Metrics

- Subsystems integrate cleanly.
- Interfaces are stable and documented.
- Engineering handoffs are clear.
- Implementation work supports the technical plan.

## Perception Team

### Responsibilities

- Own object, gate, cone, boundary, and signal detection.
- Improve classification accuracy and reduce false positives/false negatives.
- Report perception confidence and known perception limits.
- Provide structured perception outputs for Navigation and Integration.

### Authority

- Can change perception models, thresholds, and preprocessing logic within approved interfaces.
- Can flag perception output as unsafe or unreliable.
- Can request test scenarios for visual edge cases.

### Inputs

- Camera/sensor data
- Track imagery
- Simulation frames
- Test feedback
- Failure analysis involving detection errors

### Outputs

- Detected objects and classifications
- Confidence scores
- Perception status updates
- Known limitation notes

### Success Metrics

- Lower false-positive rate.
- Lower false-negative rate.
- Stable output schema.
- Reliable detection across expected scenarios.

## Navigation Team

### Responsibilities

- Own path planning, route selection, and racing line generation.
- Convert perception/map inputs into safe navigation intent.
- Balance speed, safety, and recoverability.
- Provide planned trajectory outputs for Controls.

### Authority

- Can change path planning algorithms within approved interfaces.
- Can reject perception inputs that are insufficient for safe planning.
- Can declare a route unsafe and request fallback behavior.

### Inputs

- Perception outputs
- Track map data
- Vehicle position
- Race Intelligence strategy guidance
- Failure reports involving route selection

### Outputs

- Planned path
- Racing line recommendation
- Navigation confidence
- Unsafe route warnings

### Success Metrics

- Safe path generation rate.
- Reduced off-track events.
- Improved lap consistency.
- Clear handoff to Controls.

## Controls Team

### Responsibilities

- Own throttle, braking, steering, and stability control behavior.
- Convert planned trajectories into vehicle commands.
- Tune control response for smoothness, speed, and recoverability.
- Report control instability and command saturation issues.

### Authority

- Can tune control parameters within approved safety constraints.
- Can limit aggressive navigation requests when control stability is at risk.
- Can request additional telemetry from Testing or Integration.

### Inputs

- Navigation outputs
- Vehicle state
- Telemetry
- Simulation results
- Failure reports involving instability or command behavior

### Outputs

- Vehicle control commands
- Control tuning notes
- Stability warnings
- Control performance metrics

### Success Metrics

- Reduced oscillation.
- Fewer crashes caused by control instability.
- Smooth command execution.
- Improved lap completion consistency.

## Testing Team

### Responsibilities

- Own test execution, regression checks, simulation validation, and result reporting.
- Maintain repeatable test procedures.
- Verify whether builds meet acceptance criteria.
- Report pass/fail status without changing production behavior.

### Authority

- Can block release readiness based on failing tests.
- Can request fixes from owning teams.
- Can define test coverage needs with Technical Director approval.

### Inputs

- Build artifacts
- Test plans
- Acceptance criteria
- Simulation scenarios
- Bug fix candidates

### Outputs

- Test results
- Regression reports
- Build readiness status
- Reproduction steps for failures

### Success Metrics

- Tests are repeatable.
- Failures are clearly reported.
- Regression coverage improves.
- Release readiness calls are evidence-based.

## Integration Team

### Responsibilities

- Own end-to-end assembly of subsystems.
- Maintain working connections between Perception, Navigation, Controls, Testing, and dashboard reporting.
- Detect schema, dependency, and handoff mismatches.
- Prepare integrated builds for Testing.

### Authority

- Can reject subsystem changes that break integration contracts.
- Can require teams to fix incompatible interfaces.
- Can freeze integration inputs during stabilization windows.

### Inputs

- Subsystem outputs
- Interface contracts
- Build results
- Test feedback
- Chief Engineer implementation plans

### Outputs

- Integrated builds
- Integration status reports
- Interface mismatch reports
- Handoff requirements

### Success Metrics

- Successful integrated builds.
- Fewer interface breakages.
- Faster diagnosis of integration failures.
- Clean handoff to Testing.

## Race Intelligence Team

### Responsibilities

- Own race strategy, lap performance interpretation, and operational recommendations.
- Analyze lap times, crash rates, completion rates, and scenario trends.
- Recommend strategic priorities based on performance data.
- Separate performance insight from engineering implementation.

### Authority

- Can recommend strategic changes to priorities.
- Can request targeted tests or simulations.
- Can flag performance trends that need Team Principal or Technical Director attention.

### Inputs

- Lap times
- Crash rate
- Completion rate
- Test results
- Simulation logs
- Agent status updates

### Outputs

- Race intelligence summaries
- Performance trend reports
- Strategy recommendations
- Priority recommendations

### Success Metrics

- Clear identification of performance bottlenecks.
- Better strategic prioritization.
- Improved understanding of lap and crash trends.
- Recommendations lead to measurable gains.

## Failure Analysis Team

### Responsibilities

- Own root-cause analysis for crashes, failed tests, regressions, and blocked runs.
- Classify failures by likely owning subsystem.
- Preserve evidence and reproduction details.
- Recommend corrective actions without directly owning implementation.

### Authority

- Can request logs, telemetry, screenshots, simulation recordings, and reproduction runs.
- Can assign likely failure ownership for investigation.
- Can escalate unresolved high-risk failures to the Technical Director.

### Inputs

- Crash logs
- Test failures
- Simulation recordings
- Telemetry
- Agent notes
- Integration reports

### Outputs

- Failure analysis reports
- Root-cause hypotheses
- Reproduction steps
- Corrective action recommendations

### Success Metrics

- Faster root-cause identification.
- Fewer repeated failures.
- Clear ownership of fixes.
- High-risk failures are escalated promptly.

## Collaboration Rules

- Perception owns what the system sees.
- Navigation owns where the system intends to go.
- Controls owns how the vehicle executes that intent.
- Testing owns whether behavior passes defined checks.
- Integration owns whether subsystems work together.
- Race Intelligence owns strategic interpretation of performance.
- Failure Analysis owns root-cause investigation.
- Chief Engineer owns engineering coordination and interfaces.
- Technical Director owns technical direction and standards.
- Team Principal owns execution coordination.
- Owner owns final authority.
