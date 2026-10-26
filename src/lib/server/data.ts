import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { getDb, isDatabaseConfigured } from "@/db";
import { summarize, type VerificationRecord } from "@/lib/verification";
import { addDaysToKey, isNotOver, todayKey } from "@/lib/dates";
import { isPackageType, priceFor } from "@/lib/pricing";
import { LEVELS, ONLINE_LOCATION, POSITIONS } from "@/lib/coach-taxonomy";
import {
  coachAvailability,
  coachVerifications,
  analyticsEvents,
  athleteProfiles,
  bookings,
  coachFeedback,
  coachProfiles,
  messages,
  messageThreads,
  reviews,
  socialPosts,
  studentAthletes,
  timeSlots,
  users,
} from "@/db/schema";
import {
  coaches as staticCoaches,
  demoBookings,
  getCoachById as getStaticCoachById,
  getReviewsByCoach as getStaticReviewsByCoach,
  getSlotsByCoach as getStaticSlotsByCoach,
  LANGUAGES,
  LOCATIONS,
  SPECIALTIES,
} from "@/lib/data";
import type {
  AthletePublicProfile,
  Booking,
  CoachFeedback,
  CoachProfile,
  Message,
  MessageThread,
  Review,
  SocialPost,
  StudentAthlete,
  TimeSlot,
} from "@/types";

function mapCoach(row: typeof coachProfiles.$inferSelect): CoachProfile {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    email: row.email,
    sport: row.sport,
    specialties: row.specialties,
    bio: row.bio,
    location: row.location,
    city: row.city,
    prefecture: row.prefecture,
    experienceYears: row.experienceYears,
    pricePerHour: row.pricePerHour,
    rating: row.rating,
    reviewCount: row.reviewCount,
    verified: row.verified,
    formats: row.formats,
    avatarUrl: row.avatarUrl,
    coverGradient: row.coverGradient,
    career: row.career,
    languages: row.languages,
    availabilityNote: row.availabilityNote,
    positions: row.positions ?? [],
    levels: row.levels ?? [],
    venues: row.venues ?? [],
    introVideoUrl: row.introVideoUrl ?? null,
  };
}

function mapReview(row: typeof reviews.$inferSelect): Review {
  return {
    id: row.id,
    coachId: row.coachId,
    authorName: row.authorName,
    rating: row.rating,
    comment: row.comment,
    date: row.date,
    athleteLevel: row.athleteLevel,
  };
}

function mapBooking(row: typeof bookings.$inferSelect): Booking {
  return {
    id: row.id,
    coachId: row.coachId,
    coachName: row.coachName,
    athleteId: row.athleteId,
    athleteName: row.athleteName,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    format: row.format,
    packageType: row.packageType,
    price: row.price,
    status: row.status,
    location: row.location ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapTimeSlot(row: typeof timeSlots.$inferSelect): TimeSlot {
  return {
    id: row.id,
    coachId: row.coachId,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    available: row.available,
  };
}

/**
 * Sample data is used ONLY when no database is configured (pure demo mode).
 * When DATABASE_URL is set the database is the source of truth: an empty table
 * means an empty marketplace, and a connection error surfaces as an error
 * instead of silently showing sample coaches.
 */
/**
 * Recorded checks per coach, so the "Verified" badge can be derived rather
 * than trusted from a column someone can flip by hand.
 */
async function loadVerifications(coachIds: string[]) {
  if (coachIds.length === 0) return new Map<string, VerificationRecord[]>();
  const rows = await getDb()
    .select()
    .from(coachVerifications)
    .where(inArray(coachVerifications.coachId, coachIds));
  const byCoach = new Map<string, VerificationRecord[]>();
  for (const r of rows) {
    const list = byCoach.get(r.coachId) ?? [];
    list.push({
      type: r.type,
      status: r.status,
      provider: r.provider,
      checkedAt: r.checkedAt,
      expiresAt: r.expiresAt,
    });
    byCoach.set(r.coachId, list);
  }
  return byCoach;
}

function withVerification(
  coach: CoachProfile,
  records: VerificationRecord[] | undefined,
): CoachProfile {
  const summary = summarize(records ?? []);
  return {
    ...coach,
    verified: summary.verified,
    verification: {
      active: summary.active,
      missing: summary.missing,
      expired: summary.expired,
      nextExpiry: summary.nextExpiry ? summary.nextExpiry.toISOString() : null,
      details: summary.details,
    },
  };
}

export async function listCoaches(): Promise<CoachProfile[]> {
  if (!isDatabaseConfigured()) return staticCoaches;
  const rows = await getDb()
    .select({ coach: coachProfiles })
    .from(coachProfiles)
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(eq(users.status, "active"))
    .orderBy(desc(coachProfiles.createdAt));
  const coaches = rows.map((r) => mapCoach(r.coach));
  const byCoach = await loadVerifications(coaches.map((c) => c.id));
  return coaches.map((c) => withVerification(c, byCoach.get(c.id)));
}

export async function getCoachById(id: string): Promise<CoachProfile | undefined> {
  if (!isDatabaseConfigured()) return getStaticCoachById(id);
  const [row] = await getDb()
    .select({ coach: coachProfiles })
    .from(coachProfiles)
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(and(eq(coachProfiles.id, id), eq(users.status, "active")))
    .limit(1);
  if (!row) return undefined;
  const coach = mapCoach(row.coach);
  const byCoach = await loadVerifications([coach.id]);
  return withVerification(coach, byCoach.get(coach.id));
}

export async function getReviewsByCoach(coachId: string): Promise<Review[]> {
  if (!isDatabaseConfigured()) return getStaticReviewsByCoach(coachId);
  const rows = await getDb().select().from(reviews).where(eq(reviews.coachId, coachId));
  return rows.map(mapReview);
}

export async function getSlotsByCoach(coachId: string): Promise<TimeSlot[]> {
  if (!isDatabaseConfigured()) {
    return getStaticSlotsByCoach(coachId).filter((s) => isNotOver(s.date, s.startTime));
  }
  await ensureRollingSlots(coachId);
  const rows = await getDb()
    .select()
    .from(timeSlots)
    .where(and(eq(timeSlots.coachId, coachId), gte(timeSlots.date, todayKey())))
    .orderBy(asc(timeSlots.date), asc(timeSlots.startTime));
  // Today's slots that have already started are no longer bookable.
  return rows.filter((r) => isNotOver(r.date, r.startTime)).map(mapTimeSlot);
}

export async function listBookingsForUser(userId: string, role: string): Promise<Booking[]> {
  if (!isDatabaseConfigured()) {
    if (role === "coach") {
      return demoBookings.filter((b) => b.coachId === "c1");
    }
    return demoBookings.filter((b) => b.athleteId === userId || b.athleteId === "u-athlete-1");
  }

  const db = getDb();
  const rows =
    role === "coach"
      ? await db
          .select({ booking: bookings })
          .from(bookings)
          .innerJoin(coachProfiles, eq(bookings.coachId, coachProfiles.id))
          .where(eq(coachProfiles.userId, userId))
      : await db.select().from(bookings).where(eq(bookings.athleteId, userId));

  return role === "coach"
    ? rows.map((r) => mapBooking((r as { booking: typeof bookings.$inferSelect }).booking))
    : (rows as (typeof bookings.$inferSelect)[]).map(mapBooking);
}

export type CreateBookingInput = {
  coachId: string;
  date: string;
  startTime: string;
  format: Booking["format"];
  packageType: Booking["packageType"];
  /** For in-person lessons: one of the coach's venues. Ignored for online. */
  location?: string;
  note?: string;
};

/**
 * Book a lesson. Everything that matters is decided here, not by the browser:
 * the slot must exist, be in the future and still be free; the price comes
 * from the coach's rate; and claiming the slot is a single conditional update,
 * so two athletes racing for the same time cannot both win.
 */
export async function createBooking(
  input: CreateBookingInput,
  athleteId: string,
  athleteName: string,
): Promise<Booking> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!isPackageType(input.packageType)) throw new Error("INVALID_PACKAGE");
  if (input.format !== "in_person" && input.format !== "online") throw new Error("INVALID_FORMAT");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("INVALID_DATE");
  if (!/^\d{2}:\d{2}$/.test(input.startTime)) throw new Error("INVALID_DATE");
  if (!isNotOver(input.date, input.startTime)) throw new Error("SLOT_IN_PAST");

  const coach = await getCoachById(input.coachId);
  if (!coach) throw new Error("COACH_UNAVAILABLE");
  if (!coach.formats.includes(input.format)) throw new Error("INVALID_FORMAT");

  const db = getDb();
  const id = `b-${randomBytes(8).toString("hex")}`;
  const createdAt = new Date();
  const price = priceFor(coach.pricePerHour, input.packageType);
  const note = input.note?.trim() ? input.note.trim().slice(0, 500) : null;

  // Online lessons happen online; in person, the athlete picks one of the
  // coach's venues (if the coach has listed any).
  let location: string | null = null;
  if (input.format === "online") location = ONLINE_LOCATION;
  else if (coach.venues?.length) {
    if (!input.location || !coach.venues.includes(input.location)) throw new Error("INVALID_LOCATION");
    location = input.location;
  }

  const booking = await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(timeSlots)
      .set({ available: false })
      .where(
        and(
          eq(timeSlots.coachId, coach.id),
          eq(timeSlots.date, input.date),
          eq(timeSlots.startTime, input.startTime),
          eq(timeSlots.available, true),
        ),
      )
      .returning();
    if (!claimed) throw new Error("SLOT_TAKEN");

    const row = {
      id,
      coachId: coach.id,
      coachName: coach.name,
      athleteId,
      athleteName,
      date: claimed.date,
      startTime: claimed.startTime,
      endTime: claimed.endTime,
      format: input.format,
      packageType: input.packageType,
      price,
      // A request: the coach accepts or declines it.
      status: "pending" as const,
      location,
      note,
      createdAt,
    };
    await tx.insert(bookings).values(row);

    // Every booking opens (or reuses) the coach–athlete conversation, so the
    // request and its follow-ups have somewhere to live from minute one.
    const [thread] = await tx
      .select({ id: messageThreads.id })
      .from(messageThreads)
      .where(and(eq(messageThreads.coachId, coach.id), eq(messageThreads.athleteId, athleteId)))
      .limit(1);
    const preview = {
      en: `Lesson requested · ${claimed.date} ${claimed.startTime}`,
      ja: `レッスンをリクエストしました · ${claimed.date} ${claimed.startTime}`,
      es: `Clase solicitada · ${claimed.date} ${claimed.startTime}`,
    };
    if (thread) {
      await tx.update(messageThreads).set({ lastMessage: preview, updatedAt: createdAt }).where(eq(messageThreads.id, thread.id));
    } else {
      await tx.insert(messageThreads).values({
        id: `t-${randomBytes(6).toString("hex")}`,
        coachId: coach.id,
        coachName: coach.name,
        athleteId,
        athleteName,
        lastMessage: preview,
        updatedAt: createdAt,
        unread: 1,
      });
    }
    return row;
  });

  return {
    ...booking,
    location: booking.location ?? undefined,
    note: booking.note ?? undefined,
    createdAt: createdAt.toISOString(),
  };
}

type Actor = { id: string; role: string };

const ATHLETE_TRANSITIONS: Partial<Record<Booking["status"], Booking["status"][]>> = {
  pending: ["cancelled"],
  confirmed: ["cancelled"],
};
const COACH_TRANSITIONS: Partial<Record<Booking["status"], Booking["status"][]>> = {
  pending: ["confirmed", "declined"],
  confirmed: ["completed", "cancelled"],
};

/**
 * Change a booking's status on behalf of someone who is allowed to.
 *
 * Athletes may cancel their own bookings; the booking's coach may confirm,
 * complete or cancel; executives may do anything. Any other caller — including
 * a signed-in member who is not on the booking — is refused.
 */
export async function changeBookingStatus(id: string, next: Booking["status"], actor: Actor) {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_NOT_CONFIGURED");
  const db = getDb();
  const [row] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!row) throw new Error("NOT_FOUND");

  let allowed: Booking["status"][] = [];
  if (actor.role === "executive") {
    allowed = ["pending", "confirmed", "completed", "cancelled", "declined"];
  } else if (row.athleteId === actor.id) {
    allowed = ATHLETE_TRANSITIONS[row.status] ?? [];
  } else {
    const [coach] = await db
      .select({ userId: coachProfiles.userId })
      .from(coachProfiles)
      .where(eq(coachProfiles.id, row.coachId))
      .limit(1);
    if (coach?.userId !== actor.id) throw new Error("FORBIDDEN");
    allowed = COACH_TRANSITIONS[row.status] ?? [];
  }
  if (!allowed.includes(next)) throw new Error("INVALID_TRANSITION");

  await db.transaction(async (tx) => {
    await tx.update(bookings).set({ status: next }).where(eq(bookings.id, id));
    // A cancelled or declined lesson gives its time back to the coach's calendar.
    if ((next === "cancelled" || next === "declined") && row.date >= todayKey()) {
      await tx
        .update(timeSlots)
        .set({ available: true })
        .where(
          and(
            eq(timeSlots.coachId, row.coachId),
            eq(timeSlots.date, row.date),
            eq(timeSlots.startTime, row.startTime),
          ),
        );
    }
  });
  return { ...row, status: next };
}

const COVER_GRADIENTS = [
  "from-sky-600 to-indigo-700",
  "from-rose-500 to-orange-500",
  "from-emerald-600 to-teal-700",
  "from-violet-600 to-purple-700",
  "from-amber-500 to-orange-600",
];

export type RegisterCoachInput = {
  name: string;
  sport: string;
  specialty: string;
  location: string;
  languages: string[];
  pricePerHour: number;
  bio: string;
};

/** How far ahead a coach's availability is always kept open. */
const SLOT_WINDOW_DAYS = 14;

export type AvailabilityBlock = { weekday: number; startTime: string; endTime: string };

/** Weekday (0 = Sunday) of a YYYY-MM-DD California calendar day. */
function weekdayOf(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

/**
 * Bookable slots for the given days, laid out from the coach's weekly
 * template. Ids are deterministic (coach-date-start) so regenerating a day
 * never duplicates and never touches a slot someone already holds.
 */
function slotsFromTemplate(coachId: string, dateKeys: string[], template: AvailabilityBlock[]) {
  const slots: (typeof timeSlots.$inferInsert)[] = [];
  for (const date of dateKeys) {
    const wd = weekdayOf(date);
    for (const b of template) {
      if (b.weekday !== wd) continue;
      slots.push({ id: `${coachId}-${date}-${b.startTime}`, coachId, date, startTime: b.startTime, endTime: b.endTime, available: true });
    }
  }
  return slots;
}

function windowDays() {
  const today = todayKey();
  return Array.from({ length: SLOT_WINDOW_DAYS }, (_, d) => addDaysToKey(today, d));
}

export async function getAvailabilityTemplate(coachId: string): Promise<AvailabilityBlock[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await getDb()
    .select({ weekday: coachAvailability.weekday, startTime: coachAvailability.startTime, endTime: coachAvailability.endTime })
    .from(coachAvailability)
    .where(eq(coachAvailability.coachId, coachId))
    .orderBy(asc(coachAvailability.weekday), asc(coachAvailability.startTime));
  return rows;
}

/**
 * Keep a rolling two-week window of bookable times — only for times the coach
 * has actually opened. A coach without a template has no bookable times.
 */
export async function ensureRollingSlots(coachId: string) {
  const db = getDb();
  const template = await getAvailabilityTemplate(coachId);
  if (template.length === 0) return;
  const today = todayKey();
  const existing = await db
    .select({ date: timeSlots.date })
    .from(timeSlots)
    .where(and(eq(timeSlots.coachId, coachId), gte(timeSlots.date, today)));
  const have = new Set(existing.map((r) => r.date));
  const missing = windowDays().filter((d) => !have.has(d));
  const rows = slotsFromTemplate(coachId, missing, template);
  if (rows.length) await db.insert(timeSlots).values(rows).onConflictDoNothing();
}

/**
 * Replace a coach's weekly availability and rebuild their upcoming open
 * times from it. Times that already carry a pending or confirmed booking are
 * kept as they are — changing availability never silently drops a lesson.
 */
export async function setAvailabilityTemplate(coachId: string, blocks: AvailabilityBlock[]) {
  const db = getDb();
  const today = todayKey();
  await db.transaction(async (tx) => {
    await tx.delete(coachAvailability).where(eq(coachAvailability.coachId, coachId));
    if (blocks.length) {
      await tx.insert(coachAvailability).values(
        blocks.map((b) => ({ id: `av-${coachId}-${b.weekday}-${b.startTime}`, coachId, ...b })),
      );
    }
    // Drop every upcoming slot that no active booking holds…
    await tx.execute(sql`
      DELETE FROM time_slots s
      WHERE s.coach_id = ${coachId} AND s.date >= ${today}
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.coach_id = s.coach_id AND b.date = s.date AND b.start_time = s.start_time
            AND b.status IN ('pending', 'confirmed')
        )
    `);
    // …and lay the window out again from the new template.
    const rows = slotsFromTemplate(coachId, windowDays(), blocks);
    if (rows.length) await tx.insert(timeSlots).values(rows).onConflictDoNothing();
  });
}

/** Weekday afternoons/evenings + Saturday morning — for demo/seed coaches only. */
export const DEMO_AVAILABILITY: AvailabilityBlock[] = [
  ...[1, 2, 3, 4, 5].flatMap((weekday) =>
    [["15:00", "16:00"], ["16:00", "17:00"], ["17:00", "18:00"], ["18:00", "19:00"], ["19:00", "20:00"]].map(
      ([startTime, endTime]) => ({ weekday, startTime, endTime }),
    ),
  ),
  ...[["09:00", "10:00"], ["10:00", "11:00"], ["11:00", "12:00"], ["13:00", "14:00"]].map(([startTime, endTime]) => ({
    weekday: 6,
    startTime,
    endTime,
  })),
];

export async function getCoachByUserId(userId: string): Promise<CoachProfile | undefined> {
  if (!isDatabaseConfigured()) return undefined;
  try {
    const [row] = await getDb()
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, userId))
      .limit(1);
    return row ? mapCoach(row) : undefined;
  } catch {
    return undefined;
  }
}

export type UpdateCoachInput = {
  name?: string;
  bio?: string;
  experienceYears?: number;
  pricePerHour?: number;
  location?: string;
  specialties?: string[];
  positions?: string[];
  levels?: string[];
  languages?: string[];
  formats?: Booking["format"][];
  venues?: string[];
  introVideoUrl?: string | null;
  avatarUrl?: string;
};

/**
 * Coach edits their own profile. Every field is validated against the shared
 * vocabularies; unknown values are rejected rather than stored.
 */
export async function updateCoachProfile(userId: string, input: UpdateCoachInput): Promise<CoachProfile> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_NOT_CONFIGURED");
  const coach = await getCoachByUserId(userId);
  if (!coach) throw new Error("NOT_FOUND");
  const bad = (m: string) => { throw new Error(`INVALID_${m}`); };
  const subset = (vals: unknown, allowed: readonly string[], field: string) => {
    if (!Array.isArray(vals) || vals.some((v) => typeof v !== "string" || !allowed.includes(v))) bad(field);
    return [...new Set(vals as string[])];
  };
  const set: Partial<typeof coachProfiles.$inferInsert> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    const n = String(input.name).trim();
    if (n.length < 2 || n.length > 80) bad("NAME");
    set.name = n;
  }
  if (input.bio !== undefined) {
    const b = String(input.bio).trim().slice(0, 1200);
    set.bio = { en: b, ja: b, es: b };
  }
  if (input.experienceYears !== undefined) {
    const y = Number(input.experienceYears);
    if (!Number.isInteger(y) || y < 0 || y > 60) bad("EXPERIENCE");
    set.experienceYears = y;
  }
  if (input.pricePerHour !== undefined) {
    const pr = Number(input.pricePerHour);
    if (!Number.isFinite(pr) || pr < 20 || pr > 500) bad("PRICE");
    set.pricePerHour = Math.round(pr);
  }
  if (input.location !== undefined) {
    if (!(LOCATIONS as readonly string[]).includes(input.location)) bad("LOCATION");
    Object.assign(set, { location: `${input.location}, CA`, city: input.location, prefecture: input.location });
  }
  if (input.specialties !== undefined) {
    set.specialties = subset(input.specialties, SPECIALTIES, "SPECIALTIES");
    if (!set.specialties.length) bad("SPECIALTIES");
  }
  if (input.positions !== undefined) set.positions = subset(input.positions, POSITIONS.map((x) => x.id), "POSITIONS");
  if (input.levels !== undefined) set.levels = subset(input.levels, LEVELS.map((x) => x.id), "LEVELS");
  if (input.languages !== undefined) {
    set.languages = subset(input.languages, LANGUAGES as unknown as string[], "LANGUAGES");
    if (!set.languages.length) bad("LANGUAGES");
  }
  if (input.formats !== undefined) {
    set.formats = subset(input.formats, ["in_person", "online"], "FORMATS") as Booking["format"][];
    if (!set.formats.length) bad("FORMATS");
  }
  if (input.venues !== undefined) {
    if (!Array.isArray(input.venues)) bad("VENUES");
    const v = [...new Set(input.venues.map((x) => String(x).trim()).filter(Boolean))];
    if (v.length > 6 || v.some((x) => x.length > 140)) bad("VENUES");
    set.venues = v;
  }
  if (input.introVideoUrl !== undefined) {
    const u = input.introVideoUrl ? String(input.introVideoUrl).trim() : "";
    if (u && !/^https:\/\/[^\s]+$/.test(u)) bad("VIDEO_URL");
    set.introVideoUrl = u || null;
  }
  if (input.avatarUrl !== undefined) {
    const u = String(input.avatarUrl).trim();
    if (!/^(https:\/\/|\/uploads\/avatars\/)[^\s]+$/.test(u)) bad("AVATAR");
    set.avatarUrl = u;
  }

  const [row] = await getDb().update(coachProfiles).set(set).where(eq(coachProfiles.id, coach.id)).returning();
  return mapCoach(row);
}

export async function createCoachProfile(
  userId: string,
  email: string,
  avatarUrl: string | undefined,
  input: RegisterCoachInput,
): Promise<CoachProfile> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const existing = await getCoachByUserId(userId);
  if (existing) return existing;

  const id = `c-${randomBytes(4).toString("hex")}`;
  const bioText = input.bio.trim();
  const bio = { en: bioText, ja: bioText, es: bioText };
  const gradient = COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)];

  const row: typeof coachProfiles.$inferInsert = {
    id,
    userId,
    name: input.name.trim(),
    email: email.toLowerCase(),
    sport: input.sport,
    specialties: [input.specialty],
    bio,
    location: `${input.location}, CA`,
    city: input.location,
    prefecture: input.location,
    experienceYears: 0,
    pricePerHour: input.pricePerHour,
    rating: 0,
    reviewCount: 0,
    verified: false,
    formats: ["in_person", "online"],
    avatarUrl: avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(input.name)}`,
    coverGradient: gradient,
    career: [],
    languages: input.languages,
    availabilityNote: "Weekdays & weekends — update in dashboard",
  };

  const db = getDb();
  await db.insert(coachProfiles).values(row);
  // No slots yet: the coach opens their own times in the availability editor.

  return mapCoach(row as typeof coachProfiles.$inferSelect);
}

export async function recordAnalyticsEvent(input: {
  name: string;
  userId?: string;
  coachId?: string;
  path?: string;
  props?: Record<string, string>;
}) {
  if (!isDatabaseConfigured()) return;
  try {
    await getDb().insert(analyticsEvents).values({
      id: `ev-${randomBytes(6).toString("hex")}`,
      name: input.name,
      userId: input.userId,
      coachId: input.coachId,
      path: input.path,
      props: input.props,
    });
  } catch {
    /* ignore */
  }
}

export async function getPlatformStats() {
  if (!isDatabaseConfigured()) {
    return {
      users: 0,
      coaches: 0,
      bookings: 0,
      signupsLast7d: 0,
      events: [] as { name: string; count: number }[],
    };
  }

  const db = getDb();
  const [[userCount], [coachCount], [bookingCount]] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(coachProfiles),
    db.select({ n: count() }).from(bookings),
  ]);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [signupRow] = await db
    .select({ n: count() })
    .from(users)
    .where(gte(users.createdAt, weekAgo));

  const eventRows = await db
    .select({ name: analyticsEvents.name, n: count() })
    .from(analyticsEvents)
    .groupBy(analyticsEvents.name)
    .orderBy(desc(count()));

  return {
    users: userCount?.n ?? 0,
    coaches: coachCount?.n ?? 0,
    bookings: bookingCount?.n ?? 0,
    signupsLast7d: signupRow?.n ?? 0,
    events: eventRows.map((r) => ({ name: r.name, count: Number(r.n) })),
  };
}

export async function countExecutives() {
  if (!isDatabaseConfigured()) return 0;
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(users)
    .where(eq(users.role, "executive"));
  return row?.n ?? 0;
}

export async function listUsersForAdmin(limit = 100) {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      statusReason: users.statusReason,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

export async function getCoachAnalytics(coachId: string) {
  if (!isDatabaseConfigured()) {
    return { profileViews: 0, bookingClicks: 0, bookings: 0 };
  }

  const db = getDb();
  const [views] = await db
    .select({ n: count() })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.coachId, coachId),
        eq(analyticsEvents.name, "coach_profile_view"),
      ),
    );

  const [clicks] = await db
    .select({ n: count() })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.coachId, coachId),
        eq(analyticsEvents.name, "booking_start"),
      ),
    );

  const [bookingCount] = await db
    .select({ n: count() })
    .from(bookings)
    .where(eq(bookings.coachId, coachId));

  return {
    profileViews: views?.n ?? 0,
    bookingClicks: clicks?.n ?? 0,
    bookings: bookingCount?.n ?? 0,
  };
}

export type { CoachProfile, Review, Booking, TimeSlot };
