import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return postgres(url, { max: 10, prepare: false });
}

export function getDb() {
  if (!globalForDb.pgClient) {
    globalForDb.pgClient = createClient();
  }
  return drizzle(globalForDb.pgClient, { schema });
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
