import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const pool = new Pool({
	connectionString: url,
	ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
export const getDb = async () => db;
export const closeDb = async () => pool.end();
