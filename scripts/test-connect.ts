import { Client } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = new Client({
  connectionString,
  ssl: connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

client.connect()
  .then(() => console.log('Connected'))
  .catch(err => console.error(err))
  .finally(() => client.end());
