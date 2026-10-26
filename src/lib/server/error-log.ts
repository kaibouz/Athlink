import { randomBytes } from "crypto";
import { desc } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { errorLogs } from "@/db/schema";

/**
 * Record a server-side failure so it shows up in the admin console
 * (Errors page) instead of only in transient function logs. Never throws.
 */
export async function logError(source: string, err: unknown, ctx: { path?: string; userId?: string } = {}) {
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(`[${source}]`, e);
  if (!isDatabaseConfigured()) return;
  try {
    await getDb().insert(errorLogs).values({
      id: `err-${randomBytes(6).toString("hex")}`,
      source,
      message: e.message.slice(0, 500),
      stack: e.stack?.slice(0, 4000) ?? null,
      path: ctx.path ?? null,
      userId: ctx.userId ?? null,
    });
  } catch {
    /* logging must never break the request */
  }
}

export async function recentErrors(limit = 100) {
  if (!isDatabaseConfigured()) return [];
  return getDb().select().from(errorLogs).orderBy(desc(errorLogs.createdAt)).limit(limit);
}
