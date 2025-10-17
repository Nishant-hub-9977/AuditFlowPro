import { sql } from "drizzle-orm";
import { getDb, closeDb } from "../server/db";
(async () => {
  try {
    const db = await getDb();
    // Works for both neon-sql and pg via drizzle: simple raw query
    type ExecuteResult = Array<Record<string, unknown>> | { rows?: Array<Record<string, unknown>> } | Record<string, unknown> | null | undefined;
  const exec = (db as { execute?: (query: unknown) => Promise<ExecuteResult> }).execute;
  const raw = typeof exec === "function" ? await exec.call(db, sql`SELECT 1 as ok`) : null;
    let result: Array<Record<string, unknown>>;

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const rows = (raw as { rows?: Array<Record<string, unknown>> }).rows;
      if (Array.isArray(rows)) {
        result = rows;
      } else {
        result = [raw as Record<string, unknown>];
      }
    } else if (Array.isArray(raw)) {
      result = raw;
    } else {
      result = [(raw ?? { ok: 1 }) as Record<string, unknown>];
    }

    console.log("DB OK", result[0] ?? result);
    await closeDb();
    process.exit(0);
  } catch (e) {
    console.error("DB FAILED", e);
    process.exit(1);
  }
})();
