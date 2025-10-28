# 🚀 AuditFlowPro Demo — Quick Start

> **Status:** ✅ **READY TO RUN** — All patches applied, code clean, docs complete

---

## ⚡ 30-Second Start

### Step 1: Open Terminal 1 (API)
```powershell
cd C:\Users\admin\Downloads\AuditFlowPro

$env:DATABASE_URL="postgresql://neon:npg@localhost:5432/neondb"
$env:JWT_SECRET="supersecretejwt"
$env:REFRESH_SECRET="supersecretefresh"

pnpm run demo:api
```
**Wait for:** `✓ API listening on :3000`

### Step 2: Open Terminal 2 (Web UI)
```powershell
cd C:\Users\admin\Downloads\AuditFlowPro

$env:VITE_API_BASE_URL="http://localhost:3000/api"

pnpm run demo:web
```
**Wait for:** `http://localhost:4173`

### Step 3: Open Terminal 3 (Seed Data — After DB Connects)
```powershell
cd C:\Users\admin\Downloads\AuditFlowPro

$env:DATABASE_URL="postgresql://neon:npg@localhost:5432/neondb"
$env:JWT_SECRET="supersecretejwt"
$env:REFRESH_SECRET="supersecretefresh"

pnpm run seed
```
**Wait for:** `✅ Seed complete!`

### Step 4: Visit App
- **Web:** http://localhost:4173 → Dashboard with data
- **API Health:** http://localhost:3000/api/health → `{ "ok": true }`

---

## 🔒 Login Credentials

```
Email:    demo@auditflow.pro
Password: demo1234
```

---

## 📚 Full Documentation

| File | When to Use |
|------|------------|
| **SETUP_GUIDE.md** | Detailed setup with prerequisites, endpoints, troubleshooting |
| **TROUBLESHOOTING.md** | Debug "localhost refused" errors, port conflicts, DB issues |
| **IMPLEMENTATION_SUMMARY.md** | What was built, what changed, verification checklist |

---

## ✅ What's Working

- ✅ **API** on `http://localhost:3000/api`
  - Full CRUD for leads, audits, industries, audit-types
  - Dashboard stats & recent activity
  - Demo mode (no auth required)

- ✅ **Web UI** on `http://localhost:4173`
  - Dashboard with stat cards
  - Lead management (create, edit, delete)
  - Audit management (create, edit, delete)
  - Reports with charts (Recharts + anime.js animations)

- ✅ **Database**
  - PostgreSQL/Neon Local on `localhost:5432`
  - 14 tables with relationships
  - Idempotent seeding script

- ✅ **Data**
  - 6 industries
  - 6 audit types
  - 10 sample leads (mixed statuses)
  - 5 sample audits (dates ±45 days)
  - 2 demo users

---

## 🔧 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Vite + React + TypeScript | Latest |
| **UI Library** | shadcn/ui (Radix) | Latest |
| **Forms** | React Hook Form + Zod | Latest |
| **Charts** | Recharts + anime.js | Latest |
| **Backend** | Express + TypeScript | Latest |
| **ORM** | Drizzle ORM | 0.44.6 |
| **Database** | PostgreSQL (Neon Local) | 14+ |
| **Build** | pnpm + esbuild | Latest |

---

## 📋 Endpoints Reference

### Lookups
```
GET /api/industries
GET /api/audit-types
```

### Leads (CRUD)
```
GET /api/leads?page=1&pageSize=20&q=search&status=new
GET /api/leads/:id
POST /api/leads
PUT /api/leads/:id
DELETE /api/leads/:id
```

### Audits (CRUD)
```
GET /api/audits?page=1&pageSize=20
GET /api/audits/:id
POST /api/audits
PUT /api/audits/:id
DELETE /api/audits/:id
```

### Dashboard
```
GET /api/dashboard/stats      → Stats by status, industry, priority
GET /api/dashboard/activity   → Recent 10 items (leads + audits)
```

### Health
```
GET /api/health               → { ok: true }
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `ERR_CONNECTION_REFUSED :3000` | Verify Terminal 1 is running and showing "listening on :3000" |
| `ERR_CONNECTION_REFUSED :4173` | Verify Terminal 2 is running and showing server URL |
| `EADDRINUSE: address already in use` | Port in use → `netstat -ano \| findstr :3000` → `taskkill /PID <pid> /F` |
| `Cannot connect to database` | Start Docker → Reconnect Neon extension → `pnpm run db:check` |
| `Seed script fails` | Ensure DB is running (`pnpm run db:check` outputs "DB OK") |

**See TROUBLESHOOTING.md for detailed debugging.**

---

## 🎯 What to Test

After all 3 terminals are running:

1. ✅ Visit http://localhost:4173 → Dashboard loads
2. ✅ Click "Create Lead" → Fill form → Submit → Toast confirms
3. ✅ Check "Recent Activity" → New lead appears
4. ✅ Click "Reports" → Charts render with data
5. ✅ Edit lead status → Verify change persists
6. ✅ Create audit → Verify Recent Activity updates
7. ✅ Test API directly: `curl http://localhost:3000/api/leads`

---

## 📦 Recent Changes (This Session)

```
e6a3d50  docs: add implementation summary
484ad58  docs: add comprehensive localhost troubleshooting guide
6ed8e0a  docs: add comprehensive setup guide for demo
b57e05f  feat: Windows-friendly demo setup with enriched seed data
af1612d  fix: correct environment variables for localhost API development
```

**Key additions:**
- Enriched seed data (10 leads + 5 audits)
- Windows-friendly scripts (no batch job prompts)
- Comprehensive documentation (setup + troubleshooting)
- Verified idempotent seeding

---

## 🔄 TypeScript & Build Status

```powershell
pnpm run typecheck    # ✅ CLEAN (0 errors)
pnpm run build        # ✅ PASSES (client + server builds successfully)
```

---

## 🚨 If Something Breaks

1. **Check logs in Terminal 1/2/3** — Most errors are logged there
2. **Consult TROUBLESHOOTING.md** — Step-by-step diagnosis
3. **Restart cleanly:**
   ```powershell
   # Kill all node processes
   taskkill /IM node.exe /F
   
   # Start fresh with Step 1-4 above
   ```

---

## 🔐 Security Notes

⚠️ **Demo Mode Active**: 
- Authentication is bypassed for demo purposes
- No auth token required to access APIs
- All data is tenant-scoped to demo organization
- Do NOT use in production without proper auth

---

## 📊 Project Structure

```
AuditFlowPro/
├── client/                 # React SPA
│   ├── src/components/    # UI components
│   ├── src/pages/         # Page components
│   ├── src/hooks/         # Custom hooks
│   ├── src/lib/           # Utilities
│   └── .env.local         # Client config ← Updated
├── server/                 # Express API
│   ├── routes.ts          # API endpoints (pre-existing, verified)
│   ├── auth.ts            # Auth middleware (demo bypass enabled)
│   ├── storage.ts         # Data layer (queries & aggregations)
│   └── index.ts           # Server entry point
├── shared/                 # Shared code
│   └── schema.ts          # Drizzle ORM schema (14 tables)
├── scripts/
│   ├── seed-demo.ts       # Seed script ← Enhanced with data
│   └── db-check.ts        # DB connection test
├── drizzle/               # Migrations (auto-generated)
├── .env                   # Root config ← Updated with /api suffix
├── package.json           # Dependencies ← Scripts updated
├── SETUP_GUIDE.md         # ← NEW: Setup instructions
├── TROUBLESHOOTING.md     # ← NEW: Debug guide
└── IMPLEMENTATION_SUMMARY.md # ← NEW: What was built
```

---

## 📞 Next Steps

1. **Start the demo** (follow 30-Second Start above)
2. **Test basic flows** (create lead, create audit, check reports)
3. **Explore API** (use DevTools Network tab to see requests)
4. **Extend features** (see IMPLEMENTATION_SUMMARY.md for ideas)

---

**Ready to go! Open those terminals and hit http://localhost:4173 🚀**
