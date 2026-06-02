import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

const files = {
  status: path.join(dataDir, 'status.json'),
  agents: path.join(dataDir, 'agents.json'),
  logs: path.join(dataDir, 'logs.json')
};

const validStatuses = ['idle', 'working', 'testing', 'blocked', 'done'];
const validRisks = ['low', 'medium', 'high'];
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

app.use(cors());
app.use(express.json());

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

app.listen(port, '0.0.0.0', () => {
  console.log(`AI Grand Prix Mission Control API running on http://0.0.0.0:${port}`);
});
