import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const apiBase = import.meta.env.VITE_API_BASE || '';

function formatTime(value) {
  if (!value || value === 'Never') return 'Never';
  return new Date(value).toLocaleString();
}

function HealthBadge({ value }) {
  return <span className={`badge health-${value}`}>{value}</span>;
}

function StatusBadge({ value }) {
  return <span className={`badge status-${value}`}>{value}</span>;
}

function RiskBadge({ value }) {
  return <span className={`badge risk-${value}`}>{value}</span>;
}

function DirectiveBadge({ value }) {
  return <span className={`badge directive-${value}`}>{value}</span>;
}

function MetricCard({ label, value }) {
  return (
    <section className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </section>
  );
}

function ExecutiveList({ items }) {
  return items?.length ? (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  ) : (
    <p>No items reported.</p>
  );
}

function AgentCard({ agent }) {
  return (
    <section className="agent-card">
      <div className="agent-card-header">
        <h3>{agent.name}</h3>
        <RiskBadge value={agent.risk} />
      </div>
      <div className="agent-status-row">
        <StatusBadge value={agent.status} />
        <span>{formatTime(agent.lastUpdateTime)}</span>
      </div>
      <div className="agent-field">
        <strong>Current task</strong>
        <p>{agent.currentTask}</p>
      </div>
      <div className="agent-field">
        <strong>Latest note</strong>
        <p>{agent.latestNote}</p>
      </div>
    </section>
  );
}

function App() {
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentDirective, setCurrentDirective] = useState(null);
  const [commandPrompt, setCommandPrompt] = useState('');
  const [autonomyLevel, setAutonomyLevel] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [directiveForm, setDirectiveForm] = useState({
    title: '',
    priority: 'medium',
    scope: 'all',
    objective: '',
    instructions: '',
    successCriteria: ''
  });
  const [error, setError] = useState('');
  const [commandMessage, setCommandMessage] = useState('');
  const [directiveMessage, setDirectiveMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  async function loadData() {
    try {
      const [summaryResponse, agentsResponse, logsResponse, directiveResponse] = await Promise.all([
        fetch(`${apiBase}/api/executive-summary`),
        fetch(`${apiBase}/api/agents`),
        fetch(`${apiBase}/api/logs`),
        fetch(`${apiBase}/api/directives/current`)
      ]);

      if (!summaryResponse.ok || !agentsResponse.ok || !logsResponse.ok || !directiveResponse.ok) {
        throw new Error('API request failed');
      }

      setExecutiveSummary(await summaryResponse.json());
      setAgents(await agentsResponse.json());
      setLogs(await logsResponse.json());
      setCurrentDirective(await directiveResponse.json());
      setError('');
      setLastRefresh(new Date());
    } catch (loadError) {
      setError(`Unable to reach API at ${apiBase || 'same origin'}`);
    }
  }

  function updateDirectiveForm(field, value) {
    setDirectiveForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function submitDirective(event) {
    event.preventDefault();
    setDirectiveMessage('');

    try {
      const response = await fetch(`${apiBase}/api/directive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(directiveForm)
      });

      if (!response.ok) {
        throw new Error('Directive request failed');
      }

      setDirectiveForm({
        title: '',
        priority: 'medium',
        scope: 'all',
        objective: '',
        instructions: '',
        successCriteria: ''
      });
      setDirectiveMessage('Directive issued.');
      await loadData();
    } catch (submitError) {
      setDirectiveMessage('Unable to issue directive.');
    }
  }

  async function submitCommand(event) {
    event.preventDefault();
    setCommandMessage('');

    if (autonomyLevel === 0) {
      setCommandMessage('Autonomy Level 0 allows manual directives only. Use Advanced.');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/command-directive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: commandPrompt,
          autonomyLevel
        })
      });

      if (!response.ok) {
        throw new Error('Command request failed');
      }

      const result = await response.json();
      setCommandPrompt('');
      setCommandMessage(`Directive generated from ${result.source}.`);
      await loadData();
    } catch (submitError) {
      setCommandMessage('Unable to generate directive.');
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!executiveSummary) {
    return (
      <main className="app-shell">
        <h1>AI Grand Prix Mission Control</h1>
        <p>Loading executive command system...</p>
        {error && <p className="error-box">{error}</p>}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Executive Command System</p>
          <h1>Mission Control</h1>
          <p className="subtitle">Team Principal dashboard for directives, decisions, risks, and recommended action.</p>
        </div>
        <div className="refresh-panel">
          <span>Auto refresh: 5s</span>
          <strong>{lastRefresh ? lastRefresh.toLocaleTimeString() : 'Pending'}</strong>
        </div>
      </header>

      {error && <p className="error-box">{error}</p>}

      <section className="overview-panel executive-panel">
        <div className="overview-header">
          <h2>Executive Summary</h2>
          <HealthBadge value={executiveSummary.projectHealth} />
        </div>
        <div className="metric-grid executive-grid">
          <MetricCard label="Project Health" value={executiveSummary.projectHealth} />
          <MetricCard label="Organizational Health" value={executiveSummary.organizationalHealth} />
          <MetricCard label="Confidence Level" value={executiveSummary.confidenceLevel} />
          <MetricCard label="Current Bottleneck" value={executiveSummary.currentBottleneck} />
          <MetricCard label="Team Consensus" value={executiveSummary.teamConsensus} />
          <MetricCard label="Recommended Action" value={executiveSummary.recommendedAction} />
        </div>
        <section className="learning-panel">
          <h3>Organizational Learning</h3>
          <p>{executiveSummary.organizationalLearning}</p>
        </section>
        <div className="executive-columns">
          <section>
            <h3>Top Blockers</h3>
            <ExecutiveList items={executiveSummary.topBlockers} />
          </section>
          <section>
            <h3>Top Risks</h3>
            <ExecutiveList items={executiveSummary.topRisks} />
          </section>
          <section>
            <h3>Pending Decisions</h3>
            <ExecutiveList items={executiveSummary.pendingDecisions} />
          </section>
          <section>
            <h3>Remediation Queue</h3>
            {executiveSummary.remediationQueue?.length ? (
              <ul>
                {executiveSummary.remediationQueue.map((task) => <li key={task.id}>{task.title}</li>)}
              </ul>
            ) : (
              <p>No remediation tasks pending.</p>
            )}
          </section>
          <section>
            <h3>Git Change Findings</h3>
            {executiveSummary.gitFindings?.length ? (
              <ul>
                {executiveSummary.gitFindings.map((finding) => (
                  <li key={finding.id}>{finding.agent}: {Object.entries(finding.summary).map(([label, count]) => `${label} ${count}`).join(', ')}</li>
                ))}
              </ul>
            ) : (
              <p>No git findings reported.</p>
            )}
          </section>
        </div>
      </section>

      <section className="team-orders-panel">
        <div className="overview-header">
          <h2>Team Orders</h2>
          {currentDirective ? <DirectiveBadge value={currentDirective.priority} /> : <DirectiveBadge value="none" />}
        </div>
        <form className="command-bar" onSubmit={submitCommand}>
          <label htmlFor="team-principal-command">Team Principal Command</label>
          <div className="command-input-row">
            <input
              id="team-principal-command"
              value={commandPrompt}
              onChange={(event) => setCommandPrompt(event.target.value)}
              placeholder="Achieve first completed lap."
              disabled={autonomyLevel === 0}
              required
            />
            <button type="submit" disabled={autonomyLevel === 0}>Generate Directive</button>
          </div>
          <div className="command-examples">
            <span>Examples:</span>
            <button type="button" onClick={() => setCommandPrompt('Achieve first completed lap.')}>Achieve first completed lap.</button>
            <button type="button" onClick={() => setCommandPrompt('Determine root cause of gate 1 failure.')}>Determine root cause of gate 1 failure.</button>
            <button type="button" onClick={() => setCommandPrompt('Improve perception reliability.')}>Improve perception reliability.</button>
          </div>
          <div className="autonomy-row">
            <label>
              <input
                type="radio"
                name="autonomy-level"
                checked={autonomyLevel === 0}
                onChange={() => setAutonomyLevel(0)}
              />
              Level 0: Manual directives only
            </label>
            <label>
              <input
                type="radio"
                name="autonomy-level"
                checked={autonomyLevel === 1}
                onChange={() => setAutonomyLevel(1)}
              />
              Level 1: Prompt-to-directive generation
            </label>
          </div>
          {commandMessage && <span className="form-message">{commandMessage}</span>}
        </form>
        {currentDirective ? (
          <div className="directive-card">
            <div className="directive-meta">
              <span>ID: {currentDirective.id}</span>
              <span>Scope: {currentDirective.scope}</span>
              <span>Issued by: {currentDirective.issuedBy}</span>
              <span>{formatTime(currentDirective.timestamp)}</span>
              <StatusBadge value={currentDirective.status} />
            </div>
            <h3>{currentDirective.title}</h3>
            <div className="agent-field">
              <strong>Objective</strong>
              <p>{currentDirective.objective}</p>
            </div>
            <div className="agent-field">
              <strong>Success criteria</strong>
              <p>{currentDirective.successCriteria}</p>
            </div>
          </div>
        ) : (
          <p className="muted-text">No active directive.</p>
        )}
        <button className="advanced-toggle" type="button" onClick={() => setShowAdvanced((current) => !current)}>
          {showAdvanced ? 'Hide Advanced' : 'Advanced'}
        </button>
        {showAdvanced && (
        <form className="directive-form" onSubmit={submitDirective}>
          <input
            value={directiveForm.title}
            onChange={(event) => updateDirectiveForm('title', event.target.value)}
            placeholder="Directive title"
            required
          />
          <div className="form-row">
            <select
              value={directiveForm.priority}
              onChange={(event) => updateDirectiveForm('priority', event.target.value)}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
            <select
              value={directiveForm.scope}
              onChange={(event) => updateDirectiveForm('scope', event.target.value)}
            >
              <option value="all">all</option>
              <option value="controls">controls</option>
              <option value="perception">perception</option>
              <option value="testing">testing</option>
              <option value="qa">qa</option>
              <option value="navigation">navigation</option>
              <option value="integration">integration</option>
            </select>
          </div>
          <textarea
            value={directiveForm.objective}
            onChange={(event) => updateDirectiveForm('objective', event.target.value)}
            placeholder="Objective"
            required
          />
          <textarea
            value={directiveForm.instructions}
            onChange={(event) => updateDirectiveForm('instructions', event.target.value)}
            placeholder="Instructions"
            required
          />
          <textarea
            value={directiveForm.successCriteria}
            onChange={(event) => updateDirectiveForm('successCriteria', event.target.value)}
            placeholder="Success criteria"
            required
          />
          <button type="submit">Issue Directive</button>
          {directiveMessage && <span className="form-message">{directiveMessage}</span>}
        </form>
        )}
      </section>

      <section>
        <h2>Agent Status Cards</h2>
        <div className="agent-grid">
          {agents.map((agent) => <AgentCard key={agent.name} agent={agent} />)}
        </div>
      </section>

      <section className="logs-panel">
        <h2>Recent Logs</h2>
        {logs.length ? (
          <div className="log-list">
            {logs.map((log, index) => (
              <article className="log-row" key={`${log.timestamp}-${index}`}>
                <div>
                  <strong>{log.agent || log.type || 'System'}</strong>
                  <p>{log.task || log.directive?.title || log.recommendation?.recommendation || log.finding?.finding || log.status}</p>
                  <span>{log.note || log.directive?.objective || log.recommendation?.rationale || log.finding?.impact || ''}</span>
                </div>
                <div className="log-meta">
                  {log.status && <StatusBadge value={log.status} />}
                  {log.risk && <RiskBadge value={log.risk} />}
                  <small>{formatTime(log.timestamp)}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No updates logged yet.</p>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
