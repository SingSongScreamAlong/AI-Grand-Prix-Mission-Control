# DigitalOcean Deployment Guide

This project can run on DigitalOcean as a single Node.js service. The Express backend serves the API and, after `npm run build`, serves the Vite frontend from `dist/`.

No authentication, database, or Docker setup is currently used.

## Required Node Version

Use Node.js 20 LTS or newer.

Recommended check:

```bash
node --version
npm --version
```

## Environment Variables

Supported variables:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `3001` | Port the Express server listens on. |
| `HOST` | No | `0.0.0.0` | Network interface for Express. Use `0.0.0.0` on servers. |
| `NODE_ENV` | No | unset | Use `production` for deployed runs. |
| `VITE_API_BASE` | No | same origin | Optional frontend API base URL used at build time. Usually leave unset for same-origin deployment. |

For same-origin production deployment, leave `VITE_API_BASE` unset. The frontend will call `/api/...` on the same domain that served the dashboard.

## Build And Start Commands

Install dependencies:

```bash
npm install
```

Build frontend:

```bash
npm run build
```

Start production server:

```bash
npm start
```

The production server serves:

- Dashboard: `http://SERVER:PORT/`
- API: `http://SERVER:PORT/api/status`

## Option 1: DigitalOcean Droplet

A Droplet gives the most direct control and is the recommended first deployment option for Mission Control v1.

### Basic Droplet Steps

1. Create an Ubuntu LTS Droplet.
2. SSH into the Droplet.
3. Install Node.js 20 LTS or newer.
4. Clone the GitHub repository.
5. Install dependencies.
6. Build the frontend.
7. Start the app with `npm start`.
8. Run it under a process manager such as `pm2` or a `systemd` service.
9. Point a domain or use the Droplet IP.

Example app setup:

```bash
git clone https://github.com/SingSongScreamAlong/AI-Grand-Prix-Mission-Control.git
cd AI-Grand-Prix-Mission-Control
npm install
npm run build
PORT=3001 HOST=0.0.0.0 NODE_ENV=production npm start
```

### Droplet Firewall Ports

For direct access without a reverse proxy:

- Open TCP `22` for SSH.
- Open TCP `3001` for Mission Control.

For a production domain with a reverse proxy:

- Open TCP `22` for SSH.
- Open TCP `80` for HTTP.
- Open TCP `443` for HTTPS.
- Keep `3001` private to localhost or the server firewall if Nginx/Caddy proxies to it.

### Droplet Environment Variables

Temporary shell example:

```bash
export PORT=3001
export HOST=0.0.0.0
export NODE_ENV=production
npm start
```

With `pm2`:

```bash
PORT=3001 HOST=0.0.0.0 NODE_ENV=production pm2 start server/index.js --name mission-control
```

## Option 2: DigitalOcean App Platform

App Platform is simpler operationally but less direct for file-based JSON persistence.

### App Platform Settings

Use the GitHub repository as the source.

Build command:

```bash
npm install && npm run build
```

Run command:

```bash
npm start
```

Environment variables:

```text
NODE_ENV=production
HOST=0.0.0.0
```

Set `PORT` only if App Platform requires or exposes a specific port. Many managed platforms inject `PORT` automatically.

Leave `VITE_API_BASE` unset for same-origin deployment.

### App Platform Warning

This app currently writes runtime state to JSON files in `data/`. App Platform filesystems may be ephemeral depending on configuration. For Mission Control v1 testing, this is acceptable. For durable hosted use, move state to persistent storage later, but do not add a database until explicitly approved.

## Windows PC Updates After Deployment

Once deployed, the Windows engineering workstation should use the deployed server URL instead of the Mac LAN IP.

Agent update example:

```powershell
.\report-agent.ps1 -Server "http://YOUR_SERVER_OR_DOMAIN:3001" -Agent "Perception Team" -Status "working" -Task "Testing gate detection" -Note "False positives reduced" -Risk "medium"
```

Status update example:

```powershell
.\update-status.ps1 -Server "http://YOUR_SERVER_OR_DOMAIN:3001" -BuildStatus "passing" -TestStatus "running" -BestLapTime "8.42" -CompletionRate "91%" -CrashRate "4%" -ActiveBranch "main"
```

If using HTTPS through a domain or reverse proxy, use:

```text
https://YOUR_DOMAIN
```

instead of the direct `http://...:3001` address.

## Mac Dashboard Access After Deployment

From the Mac, open the deployed dashboard URL in a browser:

```text
http://YOUR_SERVER_OR_DOMAIN:3001
```

Or, if using HTTPS through a domain:

```text
https://YOUR_DOMAIN
```

## Production Readiness Notes

Current deployment-ready behavior:

- Express honors `PORT`.
- Express honors `HOST`.
- `npm start` runs the production server.
- `npm run build` creates `dist/`.
- Express serves `dist/` and the API from the same origin.
- Local dev still uses `npm run dev`.

Current intentional limitations:

- No authentication.
- No database.
- JSON file storage is not designed for heavy concurrent writes.
- Runtime data in `data/*.json` should be backed up if hosted long-term.
