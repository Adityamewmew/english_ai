import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5432/english_ai";

const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });
