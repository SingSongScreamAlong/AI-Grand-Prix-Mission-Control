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

function MetricCard({ label, value }) {
  return (
    <section className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </section>
  );
}

function statusValue(status, primaryKey, fallbackKey) {
  return status[primaryKey] ?? status[fallbackKey] ?? '--';
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
  const [status, setStatus] = useState(null);
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  async function loadData() {
    try {
      const [statusResponse, agentsResponse, logsResponse] = await Promise.all([
        fetch(`${apiBase}/api/status`),
        fetch(`${apiBase}/api/agents`),
        fetch(`${apiBase}/api/logs`)
      ]);

      if (!statusResponse.ok || !agentsResponse.ok || !logsResponse.ok) {
        throw new Error('API request failed');
      }

      setStatus(await statusResponse.json());
      setAgents(await agentsResponse.json());
      setLogs(await logsResponse.json());
      setError('');
      setLastRefresh(new Date());
    } catch (loadError) {
      setError(`Unable to reach API at ${apiBase}`);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <main className="app-shell">
        <h1>AI Grand Prix Mission Control</h1>
        <p>Loading dashboard...</p>
        {error && <p className="error-box">{error}</p>}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Local Oversight Dashboard</p>
          <h1>AI Grand Prix Mission Control</h1>
          <p className="subtitle">Mac command center for PC-based AI engineering agents.</p>
        </div>
        <div className="refresh-panel">
          <span>Auto refresh: 5s</span>
          <strong>{lastRefresh ? lastRefresh.toLocaleTimeString() : 'Pending'}</strong>
        </div>
      </header>

      {error && <p className="error-box">{error}</p>}

      <section className="overview-panel">
        <div className="overview-header">
          <h2>Main Dashboard</h2>
          <HealthBadge value={status.projectHealth ?? status.overallProjectHealth} />
        </div>
        <div className="metric-grid">
          <MetricCard label="Latest build" value={statusValue(status, 'buildStatus', 'latestBuildStatus')} />
          <MetricCard label="Latest tests" value={statusValue(status, 'testStatus', 'latestTestStatus')} />
          <MetricCard label="Best lap" value={status.bestLapTime} />
          <MetricCard label="Average lap" value={status.averageLapTime} />
          <MetricCard label="Crash rate" value={status.crashRate} />
          <MetricCard label="Completion" value={status.completionRate} />
          <MetricCard label="Active branch" value={status.activeBranch} />
          <MetricCard label="Last commit" value={status.lastCommit} />
        </div>
        <div className="blockers-panel">
          <h3>Current blockers</h3>
          {status.currentBlockers?.length ? (
            <ul>
              {status.currentBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
            </ul>
          ) : (
            <p>No blockers reported.</p>
          )}
          <span>Last update: {formatTime(status.lastUpdate ?? status.timestampOfLastUpdate)}</span>
        </div>
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
                  <strong>{log.agent}</strong>
                  <p>{log.task}</p>
                  <span>{log.note}</span>
                </div>
                <div className="log-meta">
                  <StatusBadge value={log.status} />
                  <RiskBadge value={log.risk} />
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
