import * as schema from "../shared/schema";

const url = process.env.DATABASE_URL!;
if (!url) throw new Error("DATABASE_URL is required");

type PgDrizzle = typeof import("drizzle-orm/node-postgres")["drizzle"];
type NeonDrizzle = typeof import("drizzle-orm/neon-http")["drizzle"];
type NodePgClient = import("drizzle-orm/node-postgres").NodePgClient;
type DrizzleAny = ReturnType<PgDrizzle> | ReturnType<NeonDrizzle>;

const commonConfig = { schema, dialect: "postgresql" as const };

let dbInstance: DrizzleAny | undefined;
let closeDb = async () => {};

async function init() {
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: url });
  const instance = drizzle(pool as unknown as NodePgClient, commonConfig);
    dbInstance = instance;
    closeDb = async () => pool.end().catch(() => {});
    return instance;
  }

  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const sql = neon(url);
  const instance = drizzle(sql, commonConfig);
  dbInstance = instance;
  closeDb = async () => {};
  return instance;
}

// initialize immediately
export const dbPromise: Promise<DrizzleAny> = (async () => await init())();
export async function getDb(): Promise<DrizzleAny> {
  return dbInstance ?? (await dbPromise);
}
export { closeDb };
export const db = await getDb();
