import * as schema from "@shared/schema";
import { dirname } from "path";
import { mkdirSync, existsSync } from "fs";

// Load .env from server folder if available
import dotenv from "dotenv";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// ESM-compatible __dirname
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: __dirname + "/.env" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db: any;

if (process.env.DATABASE_URL.startsWith("sqlite:")) {
  // Synchronous require to avoid top-level await issues
  let Database: any;
  let drizzleSqlite: any;
  try {
    Database = require("better-sqlite3");
    drizzleSqlite = require("drizzle-orm/better-sqlite3");
  } catch (err) {
    console.error("\nERROR: better-sqlite3 is required for sqlite DATABASE_URL but failed to load.");
    console.error("This usually means you need to install build tools on Windows or use Node.js with prebuilt binaries.");
    console.error("Options:\n 1) Install Visual Studio Build Tools (Desktop C++ workload) and run 'npm install'.\n 2) Use Node 18 which may have prebuilt binaries for better-sqlite3.\ 3) Change DATABASE_URL to a Postgres/Neon connection for development.");
    throw err;
  }

  const { drizzle } = drizzleSqlite;
  const sqlitePath = process.env.DATABASE_URL.replace("sqlite:", "");
  const dir = dirname(sqlitePath);
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const client = new Database(sqlitePath);
  db = drizzle(client, { schema });
} else {
  // Neon / Postgres serverless setup
  const { Pool, neonConfig } = require("@neondatabase/serverless");
  const { drizzle } = require("drizzle-orm/neon-serverless");
  const ws = require("ws");
  neonConfig.webSocketConstructor = ws.default || ws;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { db };
