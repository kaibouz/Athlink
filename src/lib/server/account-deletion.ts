import { randomBytes } from "crypto";
import { and, count, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  athleteProfiles,
  bookings,
  coachProfiles,
  messages,
  parentLinks,
  sessions,
  users,
} from "@/db/schema";

export type DeletionResult = { mode: "deleted" | "anonymized"; clerkId: string | null };

/**
 * Delete a member account (App Store guideline 5.1.1(v)).
 *
 * If the member has no bookings or sent messages, the users row is hard-deleted
 * and its profile rows go with it via ON DELETE CASCADE. Bookings and messages
 * are shared with another member (and bookings are financial records), so when
 * any exist the account is anonymized instead: personal data is scrubbed, the
 * status becomes "deleted" (so it can never sign in or appear on the market),
 * and the other party keeps a record that reads "Deleted user".
 *
 * Executives are rejected here; they are managed from the admin console.
 */
export async function deleteMemberAccount(userId: string): Promise<DeletionResult> {
  const db = getDb();

  const [row] = await db
    .select({ id: users.id, role: users.role, clerkId: users.clerkId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
  if (row.role === "executive") throw new Error("EXECUTIVE_ACCOUNT");

  const coachRows = await db
    .select({ id: coachProfiles.id })
    .from(coachProfiles)
    .where(eq(coachProfiles.userId, userId));
  const coachIds = coachRows.map((c) => c.id);

  const [athleteBookings] = await db.select({ n: count() }).from(bookings).where(eq(bookings.athleteId, userId));
  const [coachBookings] = coachIds.length
    ? await db.select({ n: count() }).from(bookings).where(inArray(bookings.coachId, coachIds))
    : [{ n: 0 }];
  const [sentMessages] = await db.select({ n: count() }).from(messages).where(eq(messages.senderId, userId));

  const hasSharedRecords = (athleteBookings?.n ?? 0) + (coachBookings?.n ?? 0) + (sentMessages?.n ?? 0) > 0;

  await db.transaction(async (tx) => {
    await tx.delete(sessions).where(eq(sessions.userId, userId));

    if (!hasSharedRecords) {
      await tx.delete(users).where(eq(users.id, userId));
      return;
    }

    const now = new Date();
    await tx.delete(athleteProfiles).where(eq(athleteProfiles.userId, userId));
    await tx.delete(parentLinks).where(eq(parentLinks.athleteId, userId));

    if (coachIds.length) {
      await tx
        .update(coachProfiles)
        .set({
          name: "Deleted coach",
          email: `deleted-${userId}@deleted.invalid`,
          bio: { en: "", ja: "", es: "" },
          career: [],
          avatarUrl: "",
          availabilityNote: "",
          updatedAt: now,
        })
        .where(and(eq(coachProfiles.userId, userId)));
    }

    await tx
      .update(users)
      .set({
        email: `deleted-${userId}@deleted.invalid`,
        name: "Deleted user",
        clerkId: null,
        passwordHash: `deleted:${randomBytes(24).toString("hex")}`,
        avatarUrl: null,
        status: "deleted",
        statusReason: "self_deleted",
        statusChangedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId));
  });

  return { mode: hasSharedRecords ? "anonymized" : "deleted", clerkId: row.clerkId };
}
