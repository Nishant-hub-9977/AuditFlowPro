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

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
