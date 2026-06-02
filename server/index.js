import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const distDir = path.join(rootDir, 'dist');

const files = {
  status: path.join(dataDir, 'status.json'),
  agents: path.join(dataDir, 'agents.json'),
  logs: path.join(dataDir, 'logs.json'),
  directives: path.join(dataDir, 'directives.json'),
  acknowledgements: path.join(dataDir, 'acknowledgements.json'),
  findings: path.join(dataDir, 'findings.json'),
  recommendations: path.join(dataDir, 'recommendations.json')
};

const validStatuses = ['idle', 'working', 'testing', 'blocked', 'done'];
const validRisks = ['low', 'medium', 'high'];
const validDirectivePriorities = ['low', 'medium', 'high', 'critical'];
const validDirectiveScopes = ['all', 'controls', 'perception', 'testing', 'qa', 'navigation', 'integration'];
const validDirectiveStatuses = ['active', 'acknowledged', 'completed', 'cancelled'];
const allowedStatusUpdateFields = [
  'projectHealth',
  'buildStatus',
  'testStatus',
  'bestLapTime',
  'averageLapTime',
  'crashRate',
  'completionRate',
  'activeBranch',
  'lastCommit',
  'currentBlockers',
  'lastUpdate'
];

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.static(distDir));

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function nowIso() {
  return new Date().toISOString();
}

function createDirectiveId() {
  return `directive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createReportId(type) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampText(value, fallback, maxLength) {
  const text = typeof value === 'string' ? value.trim() : '';
  return (text || fallback).slice(0, maxLength);
}

function inferScope(prompt) {
  const normalizedPrompt = prompt.toLowerCase();
  if (normalizedPrompt.includes('perception') || normalizedPrompt.includes('gate') || normalizedPrompt.includes('camera')) {
    return 'perception';
  }
  if (normalizedPrompt.includes('test') || normalizedPrompt.includes('failure') || normalizedPrompt.includes('root cause')) {
    return 'testing';
  }
  if (normalizedPrompt.includes('control') || normalizedPrompt.includes('lap') || normalizedPrompt.includes('steer')) {
    return 'controls';
  }
  if (normalizedPrompt.includes('navigation') || normalizedPrompt.includes('route')) {
    return 'navigation';
  }
  if (normalizedPrompt.includes('integration') || normalizedPrompt.includes('pipeline')) {
    return 'integration';
  }
  if (normalizedPrompt.includes('quality') || normalizedPrompt.includes('qa')) {
    return 'qa';
  }
  return 'all';
}

function inferPriority(prompt) {
  const normalizedPrompt = prompt.toLowerCase();
  if (normalizedPrompt.includes('critical') || normalizedPrompt.includes('blocked') || normalizedPrompt.includes('failure')) {
    return 'critical';
  }
  if (normalizedPrompt.includes('root cause') || normalizedPrompt.includes('first completed lap') || normalizedPrompt.includes('reliability')) {
    return 'high';
  }
  return 'medium';
}

function fallbackDirectiveFromPrompt(prompt) {
  const normalizedPrompt = prompt.trim().replace(/\s+/g, ' ');
  const title = normalizedPrompt.length > 72 ? `${normalizedPrompt.slice(0, 69)}...` : normalizedPrompt;
  const scope = inferScope(normalizedPrompt);
  const priority = inferPriority(normalizedPrompt);

  return {
    title: clampText(title, 'Team Principal Command', 90),
    priority,
    scope,
    objective: clampText(normalizedPrompt, 'Execute Team Principal command.', 500),
    instructions: `Translate this command into immediate engineering action: ${normalizedPrompt}. Identify owner, current blocker, next experiment, and report progress through Mission Control.`,
    successCriteria: `The team can clearly report whether this command is complete, blocked, or needs a Team Principal decision: ${normalizedPrompt}.`
  };
}

function normalizeGeneratedDirective(generated, prompt) {
  const fallback = fallbackDirectiveFromPrompt(prompt);
  const priority = validDirectivePriorities.includes(generated?.priority) ? generated.priority : fallback.priority;
  const scope = validDirectiveScopes.includes(generated?.scope) ? generated.scope : fallback.scope;

  return {
    title: clampText(generated?.title, fallback.title, 90),
    priority,
    scope,
    objective: clampText(generated?.objective, fallback.objective, 500),
    instructions: clampText(generated?.instructions, fallback.instructions, 1400),
    successCriteria: clampText(generated?.successCriteria, fallback.successCriteria, 700)
  };
}

async function generateDirectiveFromLlm(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      source: 'fallback',
      directive: fallbackDirectiveFromPrompt(prompt)
    };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'Convert a Team Principal command into a JSON directive. Return only valid JSON with keys title, priority, scope, objective, instructions, successCriteria. priority must be low, medium, high, or critical. scope must be all, controls, perception, testing, qa, navigation, or integration.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    return {
      source: 'fallback',
      directive: fallbackDirectiveFromPrompt(prompt)
    };
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || '{}';
  let parsed = {};

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return {
      source: 'fallback',
      directive: fallbackDirectiveFromPrompt(prompt)
    };
  }

  return {
    source: 'llm',
    directive: normalizeGeneratedDirective(parsed, prompt)
  };
}

function newestFirst(items) {
  return [...items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function findCurrentBottleneck(agents, status) {
  const blockedAgent = agents.find((agent) => agent.status === 'blocked');
  if (blockedAgent) {
    return `${blockedAgent.name}: ${blockedAgent.currentTask}`;
  }

  const highRiskAgent = agents.find((agent) => agent.risk === 'high');
  if (highRiskAgent) {
    return `${highRiskAgent.name}: ${highRiskAgent.currentTask}`;
  }

  if (status.currentBlockers?.length) {
    return status.currentBlockers[0];
  }

  return 'No active bottleneck reported.';
}

function summarizeConsensus(agents, acknowledgements, recommendations) {
  const activeAgents = agents.filter((agent) => ['working', 'testing'].includes(agent.status)).length;
  const latestRecommendation = newestFirst(recommendations)[0];
  const latestAcknowledgements = newestFirst(acknowledgements).slice(0, 3);

  if (latestRecommendation) {
    return `Latest recommendation from ${latestRecommendation.agent}: ${latestRecommendation.recommendation}`;
  }

  if (latestAcknowledgements.length > 0) {
    return `${latestAcknowledgements.length} recent acknowledgement(s); ${activeAgents} agent(s) actively working or testing.`;
  }

  return `${activeAgents} agent(s) actively working or testing. Awaiting consensus reports.`;
}

function summarizeTopRisks(agents, findings) {
  const agentRisks = agents
    .filter((agent) => ['high', 'medium'].includes(agent.risk))
    .map((agent) => `${agent.name}: ${agent.risk} risk`);
  const findingRisks = newestFirst(findings)
    .filter((finding) => ['high', 'critical'].includes(finding.severity))
    .slice(0, 3)
    .map((finding) => `${finding.agent}: ${finding.finding}`);

  return [...findingRisks, ...agentRisks].slice(0, 5);
}

function summarizePendingDecisions(directives, recommendations) {
  const activeDirectives = directives
    .filter((directive) => directive.status === 'active')
    .map((directive) => `Directive pending: ${directive.title}`);
  const pendingRecommendations = recommendations
    .filter((recommendation) => recommendation.status === 'pending')
    .map((recommendation) => `Recommendation pending: ${recommendation.recommendation}`);

  return [...activeDirectives, ...pendingRecommendations].slice(0, 5);
}

function summarizeStatus(agents, currentStatus) {
  const blockedAgents = agents.filter((agent) => agent.status === 'blocked');
  const highRiskAgents = agents.filter((agent) => agent.risk === 'high');
  const doneAgents = agents.filter((agent) => agent.status === 'done');
  const activeAgents = agents.filter((agent) => ['working', 'testing'].includes(agent.status));

  let overallProjectHealth = 'green';
  if (blockedAgents.length > 0 || highRiskAgents.length > 0) {
    overallProjectHealth = 'red';
  } else if (activeAgents.length > 0) {
    overallProjectHealth = 'yellow';
  }

  const completionRate = agents.length > 0 ? Math.round((doneAgents.length / agents.length) * 100) : 0;

  return {
    ...currentStatus,
    overallProjectHealth,
    completionRate: `${completionRate}%`,
    currentBlockers: blockedAgents.map((agent) => `${agent.name}: ${agent.currentTask}`),
    timestampOfLastUpdate: nowIso()
  };
}

app.get('/api/status', async (req, res) => {
  const status = await readJson(files.status, {});
  res.json(status);
});

app.get('/api/agents', async (req, res) => {
  const agents = await readJson(files.agents, []);
  res.json(agents);
});

app.get('/api/logs', async (req, res) => {
  const logs = await readJson(files.logs, []);
  res.json(logs.slice(-100).reverse());
});

app.get('/api/executive-summary', async (req, res) => {
  const [status, agents, directives, acknowledgements, findings, recommendations] = await Promise.all([
    readJson(files.status, {}),
    readJson(files.agents, []),
    readJson(files.directives, []),
    readJson(files.acknowledgements, []),
    readJson(files.findings, []),
    readJson(files.recommendations, [])
  ]);
  const topRisks = summarizeTopRisks(agents, findings);
  const pendingDecisions = summarizePendingDecisions(directives, recommendations);
  const latestRecommendation = newestFirst(recommendations)[0];

  res.json({
    projectHealth: status.projectHealth ?? status.overallProjectHealth ?? 'unknown',
    currentBottleneck: findCurrentBottleneck(agents, status),
    teamConsensus: summarizeConsensus(agents, acknowledgements, recommendations),
    topRisks: topRisks.length ? topRisks : ['No top risks reported.'],
    recommendedAction: latestRecommendation?.recommendation || 'Maintain current execution plan and wait for agent recommendations.',
    pendingDecisions: pendingDecisions.length ? pendingDecisions : ['No pending decisions reported.'],
    timestamp: nowIso()
  });
});

app.get('/api/directives', async (req, res) => {
  const directives = await readJson(files.directives, []);
  res.json([...directives].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

app.get('/api/directives/current', async (req, res) => {
  const directives = await readJson(files.directives, []);
  const activeDirectives = directives
    .filter((directive) => directive.status === 'active')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(activeDirectives[0] || null);
});

app.post('/api/directive', async (req, res) => {
  const { priority, scope, title, objective, instructions, successCriteria } = req.body;

  if (!priority || !scope || !title || !objective || !instructions || !successCriteria) {
    return res.status(400).json({
      error: 'priority, scope, title, objective, instructions, and successCriteria are required'
    });
  }

  if (!validDirectivePriorities.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${validDirectivePriorities.join(', ')}` });
  }

  if (!validDirectiveScopes.includes(scope)) {
    return res.status(400).json({ error: `scope must be one of: ${validDirectiveScopes.join(', ')}` });
  }

  const timestamp = nowIso();
  const directive = {
    id: createDirectiveId(),
    timestamp,
    issuedBy: 'Team Principal',
    priority,
    scope,
    title,
    objective,
    instructions,
    successCriteria,
    status: 'active'
  };
  const directives = await readJson(files.directives, []);
  const logs = await readJson(files.logs, []);
  const logEntry = {
    type: 'directive-created',
    timestamp,
    directive
  };

  directives.push(directive);
  logs.push(logEntry);

  await writeJson(files.directives, directives);
  await writeJson(files.logs, logs);

  res.status(201).json({ ok: true, directive, log: logEntry });
});

app.post('/api/command-directive', async (req, res) => {
  const { prompt, autonomyLevel } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (autonomyLevel !== 1) {
    return res.status(400).json({ error: 'autonomyLevel must be 1 for prompt-to-directive generation' });
  }

  const generated = await generateDirectiveFromLlm(prompt);
  const timestamp = nowIso();
  const directive = {
    id: createDirectiveId(),
    timestamp,
    issuedBy: 'Team Principal',
    ...generated.directive,
    status: 'active'
  };
  const directives = await readJson(files.directives, []);
  const logs = await readJson(files.logs, []);
  const logEntry = {
    type: 'command-directive-created',
    timestamp,
    source: generated.source,
    prompt,
    directive
  };

  directives.push(directive);
  logs.push(logEntry);

  await writeJson(files.directives, directives);
  await writeJson(files.logs, logs);

  res.status(201).json({ ok: true, source: generated.source, directive, log: logEntry });
});

app.patch('/api/directive/:id', async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  if (!validDirectiveStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validDirectiveStatuses.join(', ')}` });
  }

  const timestamp = nowIso();
  const directives = await readJson(files.directives, []);
  const directive = directives.find((item) => item.id === req.params.id);

  if (!directive) {
    return res.status(404).json({ error: `Unknown directive: ${req.params.id}` });
  }

  const previousStatus = directive.status;
  directive.status = status;
  directive.updatedAt = timestamp;

  const logs = await readJson(files.logs, []);
  const logEntry = {
    type: 'directive-updated',
    timestamp,
    directiveId: directive.id,
    previousStatus,
    status
  };

  logs.push(logEntry);

  await writeJson(files.directives, directives);
  await writeJson(files.logs, logs);

  res.json({ ok: true, directive, log: logEntry });
});

app.get('/api/acknowledgements', async (req, res) => {
  const acknowledgements = await readJson(files.acknowledgements, []);
  res.json(newestFirst(acknowledgements));
});

app.post('/api/acknowledgement', async (req, res) => {
  const { directiveId, agent, note } = req.body;

  if (!directiveId || !agent) {
    return res.status(400).json({ error: 'directiveId and agent are required' });
  }

  const timestamp = nowIso();
  const acknowledgement = {
    id: createReportId('acknowledgement'),
    timestamp,
    directiveId,
    agent,
    note: note || '',
    status: 'acknowledged'
  };
  const acknowledgements = await readJson(files.acknowledgements, []);
  const logs = await readJson(files.logs, []);
  const logEntry = {
    type: 'directive-acknowledged',
    timestamp,
    acknowledgement
  };

  acknowledgements.push(acknowledgement);
  logs.push(logEntry);

  await writeJson(files.acknowledgements, acknowledgements);
  await writeJson(files.logs, logs);

  res.status(201).json({ ok: true, acknowledgement, log: logEntry });
});

app.get('/api/findings', async (req, res) => {
  const findings = await readJson(files.findings, []);
  res.json(newestFirst(findings));
});

app.post('/api/finding', async (req, res) => {
  const { agent, finding, impact, severity } = req.body;

  if (!agent || !finding || !impact || !severity) {
    return res.status(400).json({ error: 'agent, finding, impact, and severity are required' });
  }

  if (!validDirectivePriorities.includes(severity)) {
    return res.status(400).json({ error: `severity must be one of: ${validDirectivePriorities.join(', ')}` });
  }

  const timestamp = nowIso();
  const findingEntry = {
    id: createReportId('finding'),
    timestamp,
    agent,
    finding,
    impact,
    severity
  };
  const findings = await readJson(files.findings, []);
  const logs = await readJson(files.logs, []);
  const logEntry = {
    type: 'finding-created',
    timestamp,
    finding: findingEntry
  };

  findings.push(findingEntry);
  logs.push(logEntry);

  await writeJson(files.findings, findings);
  await writeJson(files.logs, logs);

  res.status(201).json({ ok: true, finding: findingEntry, log: logEntry });
});

app.get('/api/recommendations', async (req, res) => {
  const recommendations = await readJson(files.recommendations, []);
  res.json(newestFirst(recommendations));
});

app.post('/api/recommendation', async (req, res) => {
  const { agent, recommendation, rationale, decisionNeeded } = req.body;

  if (!agent || !recommendation || !rationale) {
    return res.status(400).json({ error: 'agent, recommendation, and rationale are required' });
  }

  const timestamp = nowIso();
  const recommendationEntry = {
    id: createReportId('recommendation'),
    timestamp,
    agent,
    recommendation,
    rationale,
    decisionNeeded: decisionNeeded || '',
    status: decisionNeeded ? 'pending' : 'informational'
  };
  const recommendations = await readJson(files.recommendations, []);
  const logs = await readJson(files.logs, []);
  const logEntry = {
    type: 'recommendation-created',
    timestamp,
    recommendation: recommendationEntry
  };

  recommendations.push(recommendationEntry);
  logs.push(logEntry);

  await writeJson(files.recommendations, recommendations);
  await writeJson(files.logs, logs);

  res.status(201).json({ ok: true, recommendation: recommendationEntry, log: logEntry });
});

app.post('/api/agent-update', async (req, res) => {
  const { agent, status, task, note, risk } = req.body;

  if (!agent || !status || !task || !note || !risk) {
    return res.status(400).json({ error: 'agent, status, task, note, and risk are required' });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  if (!validRisks.includes(risk)) {
    return res.status(400).json({ error: `risk must be one of: ${validRisks.join(', ')}` });
  }

  const timestamp = nowIso();
  const agents = await readJson(files.agents, []);
  const existingAgent = agents.find((item) => item.name.toLowerCase() === agent.toLowerCase());

  if (!existingAgent) {
    return res.status(404).json({ error: `Unknown agent: ${agent}` });
  }

  existingAgent.status = status;
  existingAgent.currentTask = task;
  existingAgent.latestNote = note;
  existingAgent.risk = risk;
  existingAgent.lastUpdateTime = timestamp;

  const currentStatus = await readJson(files.status, {});
  const nextStatus = summarizeStatus(agents, currentStatus);
  const logs = await readJson(files.logs, []);

  const logEntry = {
    timestamp,
    agent: existingAgent.name,
    status,
    task,
    note,
    risk
  };

  logs.push(logEntry);

  await writeJson(files.agents, agents);
  await writeJson(files.status, nextStatus);
  await writeJson(files.logs, logs);

  res.json({ ok: true, agent: existingAgent, status: nextStatus, log: logEntry });
});

app.post('/api/status-update', async (req, res) => {
  const incomingFields = Object.keys(req.body);
  const invalidFields = incomingFields.filter((field) => !allowedStatusUpdateFields.includes(field));

  if (invalidFields.length > 0) {
    return res.status(400).json({ error: `unsupported fields: ${invalidFields.join(', ')}` });
  }

  if (incomingFields.length === 0) {
    return res.status(400).json({ error: 'at least one status field is required' });
  }

  if ('currentBlockers' in req.body && !Array.isArray(req.body.currentBlockers)) {
    return res.status(400).json({ error: 'currentBlockers must be an array' });
  }

  const timestamp = req.body.lastUpdate || nowIso();
  const currentStatus = await readJson(files.status, {});
  const statusUpdate = {
    ...req.body,
    lastUpdate: timestamp
  };
  const nextStatus = {
    ...currentStatus,
    ...statusUpdate
  };
  const logs = await readJson(files.logs, []);
  const logEntry = {
    type: 'status-update',
    timestamp,
    update: statusUpdate
  };

  logs.push(logEntry);

  await writeJson(files.status, nextStatus);
  await writeJson(files.logs, logs);

  res.json({ ok: true, status: nextStatus, log: logEntry });
});

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distDir, 'index.html'));
  }

  return next();
});

app.listen(port, host, () => {
  console.log(`AI Grand Prix Mission Control running on http://${host}:${port}`);
});
