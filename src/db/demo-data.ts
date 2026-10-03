/**
 * Give a real signed-in account the full demo dataset.
 *
 * The seeded fixtures hang off `u-athlete-1` (Ethan Park). An account created
 * through Clerk starts empty, so every screen in a live demo reads as an empty
 * state — no sessions, no metrics, no breakdown, no threads. This clones that
 * dataset onto a chosen account so the product can actually be shown.
 *
 *   npm run db:demo -- you@example.com
 *   npm run db:demo -- you@example.com --reset   # clear this account's rows first
 *
 * Idempotent: re-running replaces the account's demo rows rather than stacking.
 */

import { todayKey } from "@/lib/dates";
import { randomBytes } from "crypto";
import { and, eq, like } from "drizzle-orm";
import { getDb } from "@/db";
import {
  aiBreakdowns,
  athleteGoals,
  athleteMetrics,
  athleteProfiles,
  bookings,
  messageThreads,
  messages,
  parentLinks,
  users,
} from "@/db/schema";

/** The fixture account every demo row is copied from. */
const SOURCE_ATHLETE_ID = "u-athlete-1";
/** Marks rows this script owns, so a re-run can clear only those. */
const DEMO_PREFIX = "demo-";


const DAY_MS = 86_400_000;

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return new Date(d.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/**
 * Fixtures are written with absolute dates on the day `db:seed` ran, so they
 * drift into the past. Re-anchor them: the source's first open booking (the
 * one the fixtures treat as "today") lands on the real today, and every other
 * date — bookings, metric samples, breakdowns, messages — moves by the same
 * number of days so the story stays internally consistent.
 */
function rebaseOffsetDays(sourceBookings: { date: string; status: string }[]): number {
  const open = sourceBookings
    .filter((b) => b.status === "confirmed" || b.status === "pending")
    .map((b) => b.date)
    .sort();
  const anchor = open[0] ?? sourceBookings.map((b) => b.date).sort().at(-1);
  if (!anchor) return 0;
  const today = todayKey();
  return Math.round(
    (new Date(`${today}T00:00:00Z`).getTime() - new Date(`${anchor}T00:00:00Z`).getTime()) / DAY_MS,
  );
}

function demoId(kind: string) {
  return `${DEMO_PREFIX}${kind}-${randomBytes(5).toString("hex")}`;
}

async function resolveUser(email: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  if (!row) {
    throw new Error(
      `No user with email ${email}. Sign in once through the app first so the account exists.`,
    );
  }
  return row;
}

/** Remove only the rows this script previously created for the account. */
async function clearDemoRows(athleteId: string) {
  const db = getDb();
  await db
    .delete(messages)
    .where(like(messages.id, `${DEMO_PREFIX}%`));
  await db
    .delete(messageThreads)
    .where(and(eq(messageThreads.athleteId, athleteId), like(messageThreads.id, `${DEMO_PREFIX}%`)));
  await db
    .delete(aiBreakdowns)
    .where(and(eq(aiBreakdowns.athleteId, athleteId), like(aiBreakdowns.id, `${DEMO_PREFIX}%`)));
  await db
    .delete(athleteMetrics)
    .where(and(eq(athleteMetrics.athleteId, athleteId), like(athleteMetrics.id, `${DEMO_PREFIX}%`)));
  await db
    .delete(athleteGoals)
    .where(and(eq(athleteGoals.athleteId, athleteId), like(athleteGoals.id, `${DEMO_PREFIX}%`)));
  await db
    .delete(bookings)
    .where(and(eq(bookings.athleteId, athleteId), like(bookings.id, `${DEMO_PREFIX}%`)));
  await db
    .delete(parentLinks)
    .where(and(eq(parentLinks.athleteId, athleteId), like(parentLinks.id, `${DEMO_PREFIX}%`)));
}

export async function seedDemoAccount(email: string, { reset = false } = {}) {
  const db = getDb();
  const user = await resolveUser(email);
  const athleteId = user.id;
  const name = user.name;

  if (reset) {
    await clearDemoRows(athleteId);
  }

  // --- athlete profile (the feed and scout surfaces key off this) ---
  const [existingProfile] = await db
    .select()
    .from(athleteProfiles)
    .where(eq(athleteProfiles.userId, athleteId))
    .limit(1);
  if (!existingProfile) {
    await db.insert(athleteProfiles).values({
      id: demoId("profile"),
      userId: athleteId,
      name,
      email: user.email,
      school: "Mira Costa High School",
      classYear: "2028",
      height: `5'11"`,
      weight: "172 lbs",
      position: "SS",
      batsThrows: "R/R",
      location: "Manhattan Beach, CA",
      bio: "Middle infielder working on barrel path and first-step quickness.",
      avatarUrl: user.avatarUrl ?? "",
      seasonStats: { seasonLabel: "2028 season", avg: ".338" },
      lookingForCoach: true,
      openToScouts: true,
      focusAreas: ["hitting", "defense"],
    });
  }

  // --- bookings: one upcoming, one pending, three completed ---
  const sourceBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.athleteId, SOURCE_ATHLETE_ID));
  if (sourceBookings.length === 0) {
    throw new Error("Fixtures missing — run `npm run db:seed` first.");
  }
  const shift = rebaseOffsetDays(sourceBookings);

  await db.insert(bookings).values(
    sourceBookings.map((b) => ({
      ...b,
      id: demoId("bk"),
      athleteId,
      athleteName: name,
      date: addDaysIso(b.date, shift),
      createdAt: addDays(b.createdAt, shift),
    })),
  );

  // --- metrics + goals: the Progress tab and Home headline numbers ---
  const sourceMetrics = await db
    .select()
    .from(athleteMetrics)
    .where(eq(athleteMetrics.athleteId, SOURCE_ATHLETE_ID));
  if (sourceMetrics.length) {
    await db.insert(athleteMetrics).values(
      sourceMetrics.map((m) => ({
        ...m,
        id: demoId("mt"),
        athleteId,
        recordedAt: addDaysIso(m.recordedAt.slice(0, 10), shift),
      })),
    );
  }

  const existingGoals = await db
    .select({ id: athleteGoals.id })
    .from(athleteGoals)
    .where(eq(athleteGoals.athleteId, athleteId));
  if (existingGoals.length === 0) {
    const sourceGoals = await db
      .select()
      .from(athleteGoals)
      .where(eq(athleteGoals.athleteId, SOURCE_ATHLETE_ID));
    if (sourceGoals.length) {
      await db.insert(athleteGoals).values(
        sourceGoals.map((g) => ({ ...g, id: demoId("gl"), athleteId })),
      );
    }
  }

  // --- AI breakdown: the headline feature of the pitch ---
  const sourceBreakdowns = await db
    .select()
    .from(aiBreakdowns)
    .where(eq(aiBreakdowns.athleteId, SOURCE_ATHLETE_ID));
  const createdBreakdownIds: string[] = [];
  if (sourceBreakdowns.length) {
    const rows = sourceBreakdowns.map((b) => {
      const id = demoId("bd");
      createdBreakdownIds.push(id);
      return {
        ...b,
        id,
        athleteId,
        threadId: null,
        sentToCoach: false,
        createdAt: addDays(b.createdAt, shift),
      };
    });
    await db.insert(aiBreakdowns).values(rows);
  }

  // --- message threads, with the booking system chips the deck shows ---
  const sourceThreads = await db
    .select()
    .from(messageThreads)
    .where(eq(messageThreads.athleteId, SOURCE_ATHLETE_ID));
  for (const th of sourceThreads) {
    const threadId = demoId("th");
    await db.insert(messageThreads).values({
      ...th,
      id: threadId,
      athleteId,
      athleteName: name,
      updatedAt: addDays(th.updatedAt, shift),
    });
    const srcMsgs = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, th.id));
    if (srcMsgs.length) {
      await db.insert(messages).values(
        srcMsgs.map((m) => ({
          ...m,
          id: demoId("msg"),
          threadId,
          senderId: m.senderId === SOURCE_ATHLETE_ID ? athleteId : m.senderId,
          senderName: m.senderId === SOURCE_ATHLETE_ID ? name : m.senderName,
          bookingId: null,
          breakdownId: null,
          createdAt: addDays(m.createdAt, shift),
        })),
      );
    }
  }

  // --- guardian link (most athletes are minors) ---
  const existingLinks = await db
    .select({ id: parentLinks.id })
    .from(parentLinks)
    .where(eq(parentLinks.athleteId, athleteId));
  if (existingLinks.length === 0) {
    await db.insert(parentLinks).values({
      id: demoId("pl"),
      athleteId,
      guardianName: "Demo Guardian",
      guardianEmail: "guardian@example.com",
      relationship: "parent",
      status: "linked",
    });
  }

  const counts = {
    bookings: sourceBookings.length,
    metrics: sourceMetrics.length,
    breakdowns: createdBreakdownIds.length,
    threads: sourceThreads.length,
  };
  return { user: { id: athleteId, email: user.email, name }, counts };
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const email = args.find((a) => !a.startsWith("--"));
  const reset = args.includes("--reset");
  if (!email) {
    console.error("Usage: npm run db:demo -- <email> [--reset]");
    process.exit(1);
  }

  const result = await seedDemoAccount(email, { reset });
  console.log(`Demo data ready for ${result.user.name} <${result.user.email}>`);
  console.table(result.counts);
  process.exit(0);
}

if (process.argv[1]?.includes("demo-data")) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
