import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5432/english_ai";

// Use global singleton pattern to avoid exhausted connection pools in Next.js HMR
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

export const client = globalForDb.conn ?? postgres(connectionString, { max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.conn = client;

export const db = drizzle(client, { schema });
