# AuditFlowPro Troubleshooting Guide

## Quick Diagnosis: "localhost refused to connect"

This error (ERR_CONNECTION_REFUSED) means the browser can't reach the server. In a Vite + Express stack like AuditFlowPro, it almost always boils down to one of these:

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Server not running** | No "listening" log; terminal shows errors | Start `pnpm run demo:api` or `pnpm run demo:web` |
| **Port occupied** | `netstat -ano \| findstr :3000` shows LISTENING | Kill process: `taskkill /PID <pid> /F` |
| **Database disconnected** | API starts but crashes on first query | Start Docker; connect Neon extension; run `pnpm run db:check` |
| **Browser cache** | Worked before; suddenly fails | `Ctrl+Shift+Del` > Clear all > Reload |
| **Firewall blocking** | Works on phone/other PC; not localhost | Disable Windows Defender temporarily |

---

## Step 1: Verify Servers Are Running

### Terminal 1 — Start the API Server

```powershell
cd C:\Users\admin\Downloads\AuditFlowPro

$env:DATABASE_URL="postgresql://neon:npg@localhost:5432/neondb"
$env:JWT_SECRET="supersecretejwt"
$env:REFRESH_SECRET="supersecretefresh"

pnpm run demo:api
```

**Expected Output:**
```
> demo:api
> cross-env PORT=3000 tsx server/index.ts

✓ API listening on :3000
```

**If you see errors instead:**
- Port 3000 in use → See [Port Conflicts](#port-conflicts)
- `Cannot find module` → Run `pnpm install`
- Database connection error → See [Neon DB Issues](#neon-db-and-local-connect)
- Other error → Copy full error message and check [Common Server Errors](#common-server-errors)

### Terminal 2 — Start the Web UI (After API is Running)

```powershell
cd C:\Users\admin\Downloads\AuditFlowPro

$env:VITE_API_BASE_URL="http://localhost:3000/api"

pnpm run demo:web
```

**Expected Output:**
```
> demo:web
> cross-env vite preview --host 0.0.0.0 --port 4173

  ➜  Local:   http://localhost:4173/
  ➜  press q to quit
```

**If Vite fails to start:**
- Check `pnpm run build` succeeded (creates `dist/` folder)
- If missing: `dist/` not built → Run `pnpm run build` first
- Port 4173 occupied → See [Port Conflicts](#port-conflicts)

---

## Step 2: Test Basic Connectivity

### Test 1: API Health Check

```powershell
# Option A: PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# Option B: Git Bash (if installed)
curl http://localhost:3000/api/health

# Option C: Browser
# Visit: http://localhost:3000/api/health
# Should see: { "ok": true }
```

**Expected:** `{ "ok": true }` or similar JSON

**If connection refused:**
- API isn't listening → Go back to Terminal 1, verify it started
- Port 3000 blocked → See [Port Conflicts](#port-conflicts)
- Firewall issue → See [Firewall & Network](#firewall--network-issues)

### Test 2: Web UI Loads

```
Open browser to: http://localhost:4173
```

**Expected:** Dashboard page loads with empty or populated data

**If connection refused:**
- Vite preview not running → Go back to Terminal 2, verify it started
- Port 4173 blocked → See [Port Conflicts](#port-conflicts)

---

## Step 3: Database Verification

If the API starts but crashes on DB queries:

### Check 1: Is Neon/PostgreSQL Running?

```powershell
# Check if Neon Local tunnel is active (localhost:5432)
Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue | Select-Object State, OwningProcess
```

**Expected:** `State: Listen` with a process ID

**If nothing returns:**
- **Docker not running** → Start Docker Desktop
- **Neon extension not connected** → Open VS Code Neon sidebar > Click "Connect to branch"
- **Port not listening** → Restart Neon extension

### Check 2: Test DB Connection

```powershell
$env:DATABASE_URL="postgresql://neon:npg@localhost:5432/neondb"
$env:JWT_SECRET="supersecretejwt"
$env:REFRESH_SECRET="supersecretefresh"

pnpm run db:check
```

**Expected Output:**
```
✓ DB OK
```

**If connection refused:**
- Neon extension not connected → In VS Code, click Neon in sidebar > "Connect to branch" > wait 10s
- Docker not running → Start Docker Desktop
- Port conflict → Run `Get-NetTCPConnection -LocalPort 5432` and kill if necessary

### Check 3: Run Seed Script

Once DB is connected:

```powershell
pnpm run seed
```

**Expected Output:**
```
✓ Seeded 6 industries
✓ Seeded 6 audit types
✓ Seeded 10 leads
✓ Seeded 5 audits
✅ Seed complete!
```

---

## Port Conflicts

### Find Process Using Port

```powershell
# Check port 3000
netstat -ano | findstr :3000

# Check port 4173
netstat -ano | findstr :4173

# Check port 5432 (DB)
Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
```

**Output format:** `Proto LocalAddr:LocalPort State PID`

### Kill the Process

```powershell
# Replace <PID> with the process ID from above
taskkill /PID <PID> /F

# Example: taskkill /PID 12345 /F
```

### Alternative Ports

If you can't kill the process, use different ports:

**For API (change from 3000):**
```powershell
$env:PORT=3001
pnpm run demo:api  # Now on http://localhost:3001
```

**For Web (change from 4173):**
```powershell
# Edit package.json temporarily or run:
pnpm exec vite preview --port 5000  # Now on http://localhost:5000
```

Then update client URL:
```powershell
$env:VITE_API_BASE_URL="http://localhost:3001/api"  # Match new API port
```

---

## Neon DB and Local Connect

### Prerequisites

- **Docker Desktop** installed and running
- **VS Code Neon extension** installed (`neon.neon`)
- **Neon account** with a project created

### Connection Steps

1. **Open Neon Sidebar** → Click Neon icon in VS Code left sidebar
2. **Sign In** → Click "Sign in to Neon" (browser will open)
3. **Select Project** → Choose your project from dropdown
4. **Select Branch** → Choose branch (usually "main")
5. **Connect** → Click "Connect to branch" button
6. **Wait** → ~10 seconds for Docker to set up tunnel to localhost:5432

**Visual Indicators:**
- ✓ Sidebar shows "Connected to branch: main"
- ✓ `Get-NetTCPConnection -LocalPort 5432` shows LISTEN state
- ✓ `pnpm run db:check` outputs "DB OK"

### If Connection Fails

**Check Docker:**
```powershell
docker ps  # Should list containers; if "not recognized", Docker isn't running
```

**Fix:**
- Install: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- Start: Search "Docker" in Start menu, click Docker Desktop
- Wait: ~30 seconds for Docker daemon to start

**Restart Neon Extension:**
1. In VS Code, press `Ctrl+Shift+P`
2. Type "Developer: Reload Window"
3. Press Enter
4. Reconnect Neon (steps 1-5 above)

**Use Cloud URL (Temporary Workaround):**
If local tunnel keeps failing, use your Neon cloud URL:

```powershell
# Get URL from: https://console.neon.tech > Project > Connection String
$env:DATABASE_URL="postgresql://neondb_owner:<password>@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

pnpm run db:check
```

> ⚠️ This connects to cloud; slower for local dev. Use only while troubleshooting.

---

## Browser and Cache Issues

### Clear Browser Cache (Chrome)

1. Press `Ctrl+Shift+Del`
2. Select "All time" from dropdown
3. Check: ✓ Cookies, ✓ Cached images/files
4. Click "Clear data"
5. Reload `http://localhost:4173`

### Try Incognito Mode

```
Ctrl+Shift+N  # Opens new incognito window
Type: http://localhost:4173
```

Incognito bypasses cache and most extensions.

### Reset DNS Cache

```powershell
ipconfig /flushdns

# Expected: "Successfully flushed the DNS Resolver Cache."
```

### Try Another Browser

- Firefox: Download from mozilla.org
- Edge: Pre-installed on Windows 11
- Safari on Mac (if available)

If **only one browser fails**, the issue is browser-specific (cache, extension, proxy).

---

## Firewall & Network Issues

### Disable Windows Defender Firewall (Temporary)

1. Search "Windows Defender Firewall" in Start menu
2. Click "Allow an app through firewall"
3. Click "Change settings"
4. Find "Docker Desktop" → Check both boxes (Private + Public)
5. Click "OK"
6. Retry: http://localhost:3000/api/health

### Re-enable After Testing

1. Same steps
2. Uncheck Docker boxes
3. Click "OK"

### Check Antivirus

If using 3rd-party antivirus (Norton, McAfee, etc.), it may block localhost:

- **Temporarily disable** antivirus
- **Retry** connection
- If works → Add `localhost:3000` and `localhost:4173` to antivirus whitelist

### Proxy Issues

```powershell
# Check if proxy is set
Get-ItemProperty -Path "Registry::HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name ProxyServer -ErrorAction SilentlyContinue
```

If proxy is set:

1. Settings → Network & Internet → Proxy
2. Toggle "Manual proxy setup" to **OFF**
3. Retry connection

---

## Common Server Errors

### Error: "EADDRINUSE: address already in use :::3000"

**Cause:** Port 3000 occupied

**Fix:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
pnpm run demo:api  # Retry
```

---

### Error: "Cannot find module 'express'"

**Cause:** Dependencies not installed

**Fix:**
```powershell
pnpm install
pnpm run demo:api
```

---

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Cause:** Database not running

**Fix:**
1. Start Docker Desktop
2. Reconnect Neon extension in VS Code
3. Wait 10 seconds
4. Retry: `pnpm run demo:api`

---

### Error: "ENOMEM: Cannot allocate memory"

**Cause:** System running low on RAM or process leak

**Fix:**
```powershell
# Restart Windows
Restart-Computer

# Or kill large processes:
tasklist | findstr node  # Find node processes
taskkill /IM node.exe /F  # Kill all node
```

---

### Error: "TypeError: Cannot read property 'json' of undefined"

**Cause:** Mutation response parsing issue (client-side)

**Fix:**
- Check browser DevTools → Network → API request response
- Ensure API returns JSON (not HTML error page)
- Verify `server/routes.ts` returns `.json()` not `.send()`

---

## Advanced Diagnostics

### Enable Full Debug Logging

```powershell
# For Express API
$env:DEBUG="*"
pnpm run demo:api  # See all middleware logs

# For Vite
$env:VITE_LOG="debug"
pnpm run demo:web
```

### Check Running Processes

```powershell
# List all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path

# List all processes on ports 3000, 4173, 5432
netstat -ano | findstr ":3000\|:4173\|:5432"
```

### Verify TypeScript Compilation

```powershell
pnpm run typecheck  # Should output nothing (success)
```

If errors appear, fix them before running demo:
```powershell
# Example error output:
# error TS2339: Property 'X' does not exist on type 'Y'.

# Fix the TypeScript error, then retry typecheck
```

### Test Express Directly

Create a minimal test server to isolate Express issues:

```powershell
# Create test.js in repo root
New-Item -ItemType File -Name test.js
```

Add to `test.js`:
```javascript
const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`Test server on :${PORT}`));
```

Run:
```powershell
node test.js
# Visit http://localhost:3000
# Should see: { "ok": true }
```

If this works, Express is fine; issue is in AuditFlowPro code.

---

## Verification Checklist

Use this checklist to confirm everything is set up:

- [ ] Terminal 1: `pnpm run demo:api` outputs "API listening on :3000"
- [ ] Terminal 2: `pnpm run demo:web` outputs server URL
- [ ] API health: `curl http://localhost:3000/api/health` returns `{ "ok": true }`
- [ ] Web loads: `http://localhost:4173` displays dashboard (with or without data)
- [ ] Database: `pnpm run db:check` outputs "DB OK"
- [ ] Seed data: `pnpm run seed` outputs counts (6 industries, 10 leads, etc.)
- [ ] Browser DevTools: Network tab shows requests to `localhost:3000/api/*` (not timeouts)
- [ ] Create lead: Click "Create Lead" button, fill form, submit → toast appears (success or error)
- [ ] Recent Activity: Check dashboard shows new entries after creation

If all boxes ✓, the app is fully functional.

---

## Quick Reference: Commands

```powershell
# Setup
pnpm install
pnpm run typecheck

# Database
pnpm run db:check
pnpm run seed
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Demo
pnpm run demo:api              # Terminal 1
pnpm run demo:web              # Terminal 2

# Build
pnpm run build

# Diagnostics
netstat -ano | findstr :3000
Get-NetTCPConnection -LocalPort 5432
ipconfig /flushdns
taskkill /PID <pid> /F
curl http://localhost:3000/api/health
```

---

## Still Stuck?

1. **Paste full terminal output** of the error
2. **Screenshot** of DevTools Network tab (if browser fails)
3. **Confirm steps taken** from this guide
4. Share on GitHub Issues or contact support

**Typical resolution time:** 5–15 minutes with this guide; most issues = port conflict or DB not running.

---

## References

- [Hostinger: Localhost Refused to Connect](https://www.hostinger.com/tutorials/localhost-refused-to-connect-error)
- [Kinsta: ERR_CONNECTION_REFUSED](https://kinsta.com/blog/err_connection_refused/)
- [Vite Docs: Preview](https://vitejs.dev/guide/static-deploy.html)
- [Express: Hello World](https://expressjs.com/en/starter/hello-world.html)
- [Neon: Local Connect](https://neon.com/docs/local/neon-local-connect)
- [Docker: Install Windows](https://docs.docker.com/desktop/install/windows-install/)
