import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const globalForDb = globalThis as unknown as { growlyPool?: Pool };

export const pool =
  globalForDb.growlyPool ??
  new Pool({
    connectionString,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.growlyPool = pool;
}

if (process.env.VERCEL) {
  attachDatabasePool(pool);
}

export const db = drizzle(pool, { schema });
