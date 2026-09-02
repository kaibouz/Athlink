import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import {
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

export type { CoachProfile, Review, Booking, TimeSlot };
