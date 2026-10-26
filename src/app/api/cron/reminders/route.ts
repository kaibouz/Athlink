import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { bookings } from "@/db/schema";
import { addDaysToKey, todayKey } from "@/lib/dates";
import { remindBooking } from "@/lib/server/notify";
import { logError } from "@/lib/server/error-log";
import type { Booking } from "@/types";

/**
 * Daily (vercel.json cron): email both sides about tomorrow's confirmed
 * lessons, once each. Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) return NextResponse.json({ sent: 0 });
  const db = getDb();
  const tomorrow = addDaysToKey(todayKey(), 1);
  const rows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.date, tomorrow), eq(bookings.status, "confirmed"), isNull(bookings.remindedAt)));
  let sent = 0;
  for (const row of rows) {
    try {
      await remindBooking({ ...row, location: row.location ?? undefined, note: row.note ?? undefined, createdAt: row.createdAt.toISOString() } as Booking);
      await db.update(bookings).set({ remindedAt: new Date() }).where(eq(bookings.id, row.id));
      sent++;
    } catch (err) {
      await logError("cron/reminders", err, { path: row.id });
    }
  }
  return NextResponse.json({ date: tomorrow, sent });
}
