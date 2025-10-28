# AuditFlowPro Demo Setup Guide

## Quick Start (Windows PowerShell)

### Prerequisites
- PostgreSQL running locally on `localhost:5432` (or Neon Local)
- Node.js + pnpm installed
- Database: `neondb` with user `neon` / password `npg`

### 1. Set Environment Variables
```powershell
$env:DATABASE_URL="postgresql://neon:npg@localhost:5432/neondb"
$env:JWT_SECRET="supersecretejwt"
$env:REFRESH_SECRET="supersecretefresh"
$env:VITE_API_BASE_URL="http://localhost:3000/api"
```

### 2. Run Migrations (Non-Interactive)
```powershell
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```
> Why: Avoids interactive prompts that hang on Windows ([Drizzle issue #4615](https://github.com/drizzle-team/drizzle-orm/issues/4615))

### 3. Seed Demo Data
```powershell
pnpm run seed
```

**Output:**
- ✓ 6 industries (Technology, Manufacturing, Healthcare, etc.)
- ✓ 6 audit types (ISO 9001, ISO 27001, HIPAA, GDPR, SOC 2, Internal)
- ✓ 10 leads (mixed statuses: new, in_progress, converted, closed)
- ✓ 5 audits (dates ±45 days from now, various statuses)
- ✓ 2 demo users (demo@auditflow.pro, guest@auditflow.pro)

All data is scoped to tenant `00000000-0000-0000-0000-000000000001`

### 4. Run Demo (Two Terminals)

**Terminal A — API Server:**
```powershell
$env:PORT=3000; $env:JWT_SECRET="supersecretejwt"; $env:REFRESH_SECRET="supersecretefresh"; pnpm run demo:api
# Or: pnpm demo:api
```
Expected output: `API listening on :3000`

**Terminal B — Web UI:**
```powershell
$env:VITE_API_BASE_URL="http://localhost:3000/api"; pnpm run demo:web
# Or: pnpm demo:web
```
Expected output: Vite preview server on `http://localhost:4173`

> **Why separate terminals?** Avoids Windows' `Terminate batch job (Y/N)?` prompt from nested processes.

### 5. Verify Setup
- **API Health:** `http://localhost:3000/api/health` → `{ ok: true }`
- **Web UI:** `http://localhost:4173` → Dashboard with populated data
- **Industries:** `http://localhost:3000/api/industries`
- **Leads:** `http://localhost:3000/api/leads`

## Demo Credentials
- **Email:** demo@auditflow.pro
- **Password:** demo1234
- **Role:** Admin (no auth required in demo mode)

## Key Endpoints

### Lookups
- `GET /api/industries` — All industries for dropdown
- `GET /api/audit-types` — All audit types for dropdown

### Leads (Full CRUD)
- `GET /api/leads?page=1&pageSize=20&q=query&status=new` — Paginated list with filters
- `GET /api/leads/:id` — Single lead detail
- `POST /api/leads` — Create (Body: companyName, contactPerson, email, phone, status, priority, industryId)
- `PUT /api/leads/:id` — Update partial fields
- `DELETE /api/leads/:id` — Delete

### Audits
- `GET /api/audits?page=1&pageSize=20` — List all audits
- `GET /api/audits/:id` — Audit detail
- `POST /api/audits` — Create audit

### Dashboard
- `GET /api/dashboard/stats` — Aggregate stats (lead counts, audit counts, recent activity)
- `GET /api/dashboard/activity` — Recent 10 items (leads + audits)

## Troubleshooting

### Database Connection Refused
```
ECONNREFUSED — Ensure PostgreSQL/Neon Local is running on localhost:5432
```
**Fix:** Start PostgreSQL or Neon Local

### API Returns 500 Errors
- Check server logs in Terminal A
- Ensure DATABASE_URL points to correct host/port/database
- Verify tables exist: `SELECT * FROM information_schema.tables WHERE table_schema='public';`

### Web UI Cannot Reach API
- Verify `VITE_API_BASE_URL=http://localhost:3000/api` in Terminal B
- Check browser DevTools → Network tab → all requests go to `localhost:3000`
- Hard refresh: `Ctrl+Shift+R`

### Forms Hang on "Creating..."
- Check network requests in DevTools
- If 400/500 error, check server logs and API response body
- Verify lead/audit status values match schema enums

## File Changes in This Session

### `package.json`
- Fixed `demo:web` script (removed extra CLI args)
- Fixed `demo` script to use `pnpm run demo:api` syntax (Windows-friendly)

### `scripts/seed-demo.ts`
- Added 6 industries
- Added 6 audit types
- Added 10 sample leads with realistic names and statuses
- Added 5 sample audits spanning ±45 days
- Uses transaction with `onConflictDoNothing()` for idempotent re-runs
- Fixed helper functions to fetch IDs by name before inserts

### `.env` & `client/.env.local`
- Updated `VITE_API_BASE_URL` to `http://localhost:3000/api` (includes /api suffix)

### `server/routes.ts` (Pre-existing)
- Already supports: GET/POST/PUT/DELETE on `/api/leads`, `/api/industries`, `/api/audit-types`
- Demo mode bypass: Allows requests without JWT token, uses default tenant

## Next Steps
1. Start both servers (Terminal A + B)
2. Open http://localhost:4173
3. Create a new lead → verify it appears in Recent Activity
4. Create an audit → verify chart updates
5. Edit lead status → verify conversions tracked
6. Check Reports page for populated charts

## References
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Vite Preview Options](https://vite.dev/config/preview-options)
- [Neon Local Connect](https://neon.com/docs/local/neon-local-connect)
