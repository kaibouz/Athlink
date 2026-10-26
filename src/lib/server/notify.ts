import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { coachProfiles, users } from "@/db/schema";
import { logError } from "@/lib/server/error-log";
import type { Booking } from "@/types";

/**
 * Transactional email via Resend's HTTP API (no SDK). Without
 * RESEND_API_KEY + EMAIL_FROM the send is skipped and logged to the console,
 * so local dev and unconfigured previews keep working.
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || !to) {
    console.info(`[email skipped] to=${to || "?"} subject=${subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return true;
  } catch (err) {
    await logError("email", err, { path: subject });
    return false;
  }
}

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

async function parties(b: Pick<Booking, "coachId" | "athleteId">) {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const [coach] = await db
    .select({ email: users.email, name: coachProfiles.name })
    .from(coachProfiles)
    .innerJoin(users, eq(users.id, coachProfiles.userId))
    .where(eq(coachProfiles.id, b.coachId))
    .limit(1);
  const [athlete] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, b.athleteId)).limit(1);
  return { coach, athlete };
}

function when(b: Pick<Booking, "date" | "startTime" | "endTime" | "location" | "format">) {
  const where = b.format === "online" ? "Online" : b.location || "In person";
  return `${b.date} ${b.startTime}–${b.endTime} (Pacific time) · ${where}`;
}

/** Email the people a booking change concerns. Best-effort, never throws. */
export async function notifyBooking(event: "requested" | "confirmed" | "declined" | "cancelled", b: Booking, by?: "athlete" | "coach") {
  try {
    const p = await parties(b);
    if (!p?.coach || !p.athlete) return;
    const link = `${appUrl()}/bookings`;
    if (event === "requested") {
      await sendEmail(p.coach.email, `New lesson request from ${b.athleteName}`,
        `${b.athleteName} requested a lesson: ${when(b)}.\n\nAccept or decline it here: ${appUrl()}/coach\n\n— AthlinkPro`);
    } else if (event === "confirmed") {
      await sendEmail(p.athlete.email, `Lesson confirmed with ${p.coach.name}`,
        `${p.coach.name} accepted your lesson: ${when(b)}.\n\nDetails: ${link}\n\n— AthlinkPro`);
    } else if (event === "declined") {
      await sendEmail(p.athlete.email, `${p.coach.name} couldn't take this lesson`,
        `Your request for ${when(b)} was declined. Pick another time: ${appUrl()}/coaches/${b.coachId}\n\n— AthlinkPro`);
    } else if (event === "cancelled") {
      const to = by === "coach" ? p.athlete.email : p.coach.email;
      const who = by === "coach" ? p.coach.name : b.athleteName;
      await sendEmail(to, `Lesson cancelled — ${b.date} ${b.startTime}`,
        `${who} cancelled the lesson on ${when(b)}.\n\n${link}\n\n— AthlinkPro`);
    }
  } catch (err) {
    await logError("notifyBooking", err);
  }
}

/** Day-before reminder to both sides. */
export async function remindBooking(b: Booking) {
  const p = await parties(b);
  if (!p?.coach || !p.athlete) return;
  const body = `Reminder: lesson tomorrow — ${when(b)}.\nCoach: ${p.coach.name} · Athlete: ${b.athleteName}\n\n${appUrl()}/bookings\n\n— AthlinkPro`;
  await sendEmail(p.athlete.email, `Tomorrow: lesson with ${p.coach.name}`, body);
  await sendEmail(p.coach.email, `Tomorrow: lesson with ${b.athleteName}`, body);
}
