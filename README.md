# Resume Builder

Production-oriented full-stack app: **React (Vite)** + **Express** + **Prisma** + **SQLite**, with real authentication (JWT in an HTTP-only cookie), persistent resumes, a full editor for fresher and experienced layouts, HTML preview, and **PDF export** (@react-pdf/renderer).

## Features

- **Account**: Register, log in, log out (bcrypt password hashing, JWT cookie).
- **Account settings**: Update profile (name/phone/address) and change password.
- **Dashboard**: Create resumes (fresher vs experienced), list, open editor, preview, delete.
- **Editor**: Personal/contact, LinkedIn/GitHub, objective or professional summary, education, experience, skills, certifications, projects, internships, achievements, extra-curriculars. All data is saved to the database (no mocked APIs).
- **Preview & PDF**: Screen preview and downloadable PDF aligned with stored data.

## Prerequisites

- Node.js **20+** (recommended; 18+ should work)
- npm

## Setup

1. **Server environment**

   ```bash
   cd server
   copy .env.example .env
   ```

   Edit `server/.env`:

   - `JWT_SECRET` — use a long random string in production (e.g. `openssl rand -hex 32`).
   - `DATABASE_URL` — default `file:./dev.db` is fine for local SQLite (file lives next to `server/prisma/schema.prisma` per Prisma rules).
   - `FRONTEND_ORIGIN` — dev: `http://localhost:5173`. Production: your real site URL (scheme + host + port if any).
   - `COOKIE_SECURE` — set to `true` when serving **only** over HTTPS.

2. **Install dependencies**

   From the **repository root** (`resume-builder/`):

   ```bash
   npm install
   cd server
   npm install
   npx prisma migrate deploy
   cd ..
   ```

   For first-time local development you can use `npx prisma migrate dev` instead of `migrate deploy` if you prefer.

## Development

Runs the Vite dev server and the API together. The Vite dev server **proxies** `/api` to `http://localhost:3001`, so the browser stays on one origin and cookies work.

```bash
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:3001 (also reachable via http://localhost:5173/api/... through the proxy)

## Production build & run

Build the client, then serve the static build and API from one Node process:

```bash
npm run build
set NODE_ENV=production
set FRONTEND_ORIGIN=https://your-domain.example
set COOKIE_SECURE=true
set JWT_SECRET=your-production-secret
cd server
npx prisma migrate deploy
cd ..
npm run start
```

`npm run start` runs `server/src/index.js` with `NODE_ENV=production`. It serves:

- `/api/*` — REST API  
- Everything else — SPA + static assets from `dist/`

Use a process manager (systemd, PM2, Windows Service, etc.) and put the app behind HTTPS (reverse proxy such as nginx or Caddy).

### PM2 process manager (recommended)

`ecosystem.config.cjs` is included for production process management.

```bash
npm run build
cd server
npx prisma migrate deploy
cd ..
npm run start:pm2
```

Useful commands:

- `npm run pm2:logs` - tail logs
- `npm run stop:pm2` - stop and remove the process
- `pm2 save` - persist process list across reboots
- `pm2 startup` - generate startup command for your OS

### Moving off SQLite

Point `DATABASE_URL` at PostgreSQL (or another supported Prisma provider), change `provider` in `server/prisma/schema.prisma`, run `npx prisma migrate dev` to adjust migrations, and redeploy.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account (sets cookie) |
| POST | `/api/auth/login` | Log in (sets cookie) |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/auth/me` | Current user (requires cookie) |
| PATCH | `/api/auth/profile` | Update name/phone/address |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/resumes` | List resumes |
| POST | `/api/resumes` | Create resume |
| GET | `/api/resumes/:id` | Full resume + relations |
| PUT | `/api/resumes/:id` | Replace resume + all sections |
| DELETE | `/api/resumes/:id` | Delete resume |
| GET | `/api/health` | Health check |

All `/api/resumes/*` routes require authentication.

## Security notes

- Never commit `server/.env` or production `JWT_SECRET`.
- Use strong `JWT_SECRET` and HTTPS with `COOKIE_SECURE=true` in production.
- Rate limiting is applied to `/api/auth` (see `server/src/index.js`).
- The app enables strict `helmet` headers and a CSP; if you add third-party scripts/fonts, update CSP directives in `server/src/index.js`.

## SQLite backups

Create an on-demand backup:

```bash
npm run backup:sqlite
```

- Source DB: `server/prisma/dev.db`
- Output folder: `backups/`
- Default retention: latest 14 backups
- Override retention: set `BACKUP_RETENTION` environment variable

Example (PowerShell):

```powershell
$env:BACKUP_RETENTION="30"
npm run backup:sqlite
```

## Scripts (root)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite + API with watch |
| `npm run build` | Production client bundle to `dist/` |
| `npm run start` | Production: API + static SPA |
| `npm run start:pm2` | Start production app with PM2 |
| `npm run stop:pm2` | Stop/remove PM2 process |
| `npm run pm2:logs` | Tail PM2 logs |
| `npm run backup:sqlite` | Create timestamped SQLite backup |
| `npm run lint` | ESLint (client + server) |
| `npm run db:migrate` | Run `prisma migrate deploy` in `server/` |
