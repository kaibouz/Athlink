import { and, count, desc, eq, gte } from "drizzle-orm";
import { randomBytes } from "crypto";
import { getDb, isDatabaseConfigured } from "@/db";
import {
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
  reviews as staticReviews,
  timeSlots as staticTimeSlots,
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

export async function listCoaches(): Promise<CoachProfile[]> {
  if (!isDatabaseConfigured()) return staticCoaches;
  try {
    const rows = await getDb().select().from(coachProfiles);
    return rows.length > 0 ? rows.map(mapCoach) : staticCoaches;
  } catch {
    return staticCoaches;
  }
}

export async function getCoachById(id: string): Promise<CoachProfile | undefined> {
  if (!isDatabaseConfigured()) return getStaticCoachById(id);
  try {
    const [row] = await getDb().select().from(coachProfiles).where(eq(coachProfiles.id, id)).limit(1);
    return row ? mapCoach(row) : getStaticCoachById(id);
  } catch {
    return getStaticCoachById(id);
  }
}

export async function getReviewsByCoach(coachId: string): Promise<Review[]> {
  if (!isDatabaseConfigured()) return getStaticReviewsByCoach(coachId);
  try {
    const rows = await getDb().select().from(reviews).where(eq(reviews.coachId, coachId));
    return rows.length > 0 ? rows.map(mapReview) : getStaticReviewsByCoach(coachId);
  } catch {
    return getStaticReviewsByCoach(coachId);
  }
}

export async function getSlotsByCoach(coachId: string): Promise<TimeSlot[]> {
  if (!isDatabaseConfigured()) return getStaticSlotsByCoach(coachId);
  try {
    const rows = await getDb().select().from(timeSlots).where(eq(timeSlots.coachId, coachId));
    return rows.length > 0 ? rows.map(mapTimeSlot) : getStaticSlotsByCoach(coachId);
  } catch {
    return getStaticSlotsByCoach(coachId);
  }
}

export async function listBookingsForUser(userId: string, role: string): Promise<Booking[]> {
  if (!isDatabaseConfigured()) {
    if (role === "coach") {
      return demoBookings.filter((b) => b.coachId === "c1");
    }
    return demoBookings.filter((b) => b.athleteId === userId || b.athleteId === "u-athlete-1");
  }

  try {
    const db = getDb();
    const rows =
      role === "coach"
        ? await db
            .select({ booking: bookings })
            .from(bookings)
            .innerJoin(coachProfiles, eq(bookings.coachId, coachProfiles.id))
            .where(eq(coachProfiles.userId, userId))
        : await db.select().from(bookings).where(eq(bookings.athleteId, userId));

    const mapped =
      role === "coach"
        ? rows.map((r) => mapBooking((r as { booking: typeof bookings.$inferSelect }).booking))
        : (rows as (typeof bookings.$inferSelect)[]).map(mapBooking);
    return mapped;
  } catch {
    return demoBookings;
  }
}

export async function createBooking(
  input: Omit<Booking, "id" | "createdAt" | "status" | "athleteId" | "athleteName">,
  athleteId: string,
  athleteName: string,
): Promise<Booking> {
  const id = `b-${Date.now()}`;
  const createdAt = new Date();
  const booking: Booking = {
    ...input,
    id,
    athleteId,
    athleteName,
    status: "confirmed",
    createdAt: createdAt.toISOString(),
  };

  if (isDatabaseConfigured()) {
    try {
      await getDb().insert(bookings).values({
        id,
        coachId: input.coachId,
        coachName: input.coachName,
        athleteId,
        athleteName,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        format: input.format,
        packageType: input.packageType,
        price: input.price,
        status: "confirmed",
        note: input.note,
        createdAt,
      });
    } catch {
      /* fall through — return in-memory booking */
    }
  }

  return booking;
}

export async function updateBookingStatus(id: string, status: Booking["status"]) {
  if (isDatabaseConfigured()) {
    try {
      await getDb().update(bookings).set({ status }).where(eq(bookings.id, id));
    } catch {
      /* ignore */
    }
  }
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

function seedSlotsForCoach(coachId: string) {
  const slots: (typeof timeSlots.$inferInsert)[] = [];
  const times = [
    ["09:00", "10:00"],
    ["10:30", "11:30"],
    ["13:00", "14:00"],
    ["15:00", "16:00"],
    ["17:00", "18:00"],
    ["19:00", "20:00"],
  ];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 0; d < 14; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    times.forEach(([startTime, endTime], ti) => {
      slots.push({
        id: `${coachId}-${dateStr}-${startTime}`,
        coachId,
        date: dateStr,
        startTime,
        endTime,
        available: (d + ti) % 3 !== 0,
      });
    });
  }
  return slots;
}

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
  await db.insert(timeSlots).values(seedSlotsForCoach(id));

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
