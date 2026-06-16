# Wandernest

A wanderlust-themed travel accommodation platform. Browse curated stays, manage them from an admin panel.

## Stack
- Node.js / Express
- Vanilla HTML/CSS/JS frontend
- JSON file storage

## Local run
```bash
npm install
node server.js
# open http://localhost:3000
```

## Deploy (Render)
1. Push this repo to GitHub.
2. On render.com: **New +** → **Web Service** → pick this repo.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Env vars: `ADMIN_PASSWORD=admin1234%%%%%6`, `NODE_ENV=production`
6. Deploy. Public URL appears at the top of the service page.

Admin panel: `/admin` — password is the `ADMIN_PASSWORD` env var.
