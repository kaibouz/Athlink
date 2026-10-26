import { NextResponse } from "next/server";
import { and, count, eq, gte, inArray } from "drizzle-orm";
import { requireExecutive } from "@/lib/auth-server";
import { getDb, isDatabaseConfigured } from "@/db";
import { analyticsEvents, bookings } from "@/db/schema";

const STEPS = ["signup", "coach_profile_view", "search", "book_click", "booking_request"] as const;

/** MVP funnel for the last N days (default 30): event counts + completed lessons. */
export async function GET(req: Request) {
  try {
    await requireExecutive();
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNAUTHORIZED";
    return NextResponse.json({ error: code }, { status: code === "FORBIDDEN" ? 403 : 401 });
  }
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * 86_400_000);
  const db = getDb();
  const rows = await db
    .select({ name: analyticsEvents.name, n: count() })
    .from(analyticsEvents)
    .where(and(inArray(analyticsEvents.name, [...STEPS]), gte(analyticsEvents.createdAt, since)))
    .groupBy(analyticsEvents.name);
  const byName = new Map(rows.map((r) => [r.name, Number(r.n)]));
  const [done] = await db
    .select({ n: count() })
    .from(bookings)
    .where(and(eq(bookings.status, "completed"), gte(bookings.createdAt, since)));
  return NextResponse.json({
    days,
    steps: [...STEPS.map((s) => ({ key: s, count: byName.get(s) ?? 0 })), { key: "lesson_completed", count: Number(done?.n ?? 0) }],
  });
}
