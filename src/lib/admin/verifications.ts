import { randomBytes } from "crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { coachProfiles, coachVerifications } from "@/db/schema";
import {
  ALL_VERIFICATIONS,
  defaultExpiry,
  summarize,
  type VerificationRecord,
  type VerificationStatus,
  type VerificationType,
} from "@/lib/verification";

export function isVerificationType(v: unknown): v is VerificationType {
  return typeof v === "string" && (ALL_VERIFICATIONS as string[]).includes(v);
}

export function isVerificationStatus(v: unknown): v is VerificationStatus {
  return v === "pending" || v === "passed" || v === "failed" || v === "expired";
}

/** Every recorded check for a coach, newest first. */
export async function listVerifications(coachId: string) {
  if (!isDatabaseConfigured()) return [];
  return getDb()
    .select()
    .from(coachVerifications)
    .where(eq(coachVerifications.coachId, coachId))
    .orderBy(desc(coachVerifications.createdAt));
}

/** Coach list for the console, each with its derived badge state. */
export async function listCoachVerificationStatus(limit = 200) {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const coaches = await db
    .select({ id: coachProfiles.id, name: coachProfiles.name, email: coachProfiles.email })
    .from(coachProfiles)
    .orderBy(desc(coachProfiles.createdAt))
    .limit(limit);
  if (coaches.length === 0) return [];

  const rows = await db
    .select()
    .from(coachVerifications)
    .where(
      inArray(
        coachVerifications.coachId,
        coaches.map((c) => c.id),
      ),
    );

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

  return coaches.map((c) => {
    const summary = summarize(byCoach.get(c.id) ?? []);
    return {
      ...c,
      verified: summary.verified,
      missing: summary.missing,
      expired: summary.expired,
      nextExpiry: summary.nextExpiry ? summary.nextExpiry.toISOString() : null,
    };
  });
}

export interface RecordVerificationInput {
  coachId: string;
  type: VerificationType;
  status: VerificationStatus;
  provider?: string | null;
  reference?: string | null;
  notes?: string | null;
  /** Omit to default to 12 months from now for a passed check. */
  expiresAt?: Date | null;
  recordedBy: string;
}

/**
 * Record the outcome of a check.
 *
 * One row per (coach, type): a re-check replaces the previous outcome rather
 * than appending, so the badge always reflects the latest result and the
 * console does not fill with superseded rows. The audit log keeps the history.
 */
export async function recordVerification(input: RecordVerificationInput) {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_NOT_CONFIGURED");
  const db = getDb();

  const [coach] = await db
    .select({ id: coachProfiles.id })
    .from(coachProfiles)
    .where(eq(coachProfiles.id, input.coachId))
    .limit(1);
  if (!coach) throw new Error("COACH_NOT_FOUND");

  const now = new Date();
  const passed = input.status === "passed";
  const expiresAt = passed ? (input.expiresAt ?? defaultExpiry(now)) : null;

  const values = {
    coachId: input.coachId,
    type: input.type,
    status: input.status,
    provider: input.provider?.trim() || null,
    reference: input.reference?.trim() || null,
    notes: input.notes?.trim() || null,
    checkedAt: input.status === "pending" ? null : now,
    expiresAt,
    recordedBy: input.recordedBy,
    updatedAt: now,
  };

  const [existing] = await db
    .select({ id: coachVerifications.id })
    .from(coachVerifications)
    .where(
      and(eq(coachVerifications.coachId, input.coachId), eq(coachVerifications.type, input.type)),
    )
    .limit(1);

  if (existing) {
    await db
      .update(coachVerifications)
      .set(values)
      .where(eq(coachVerifications.id, existing.id));
    return { id: existing.id, created: false };
  }

  const id = `cv-${randomBytes(6).toString("hex")}`;
  await db.insert(coachVerifications).values({ id, ...values });
  return { id, created: true };
}

/** Remove a recorded check — used when one was filed against the wrong coach. */
export async function deleteVerification(coachId: string, type: VerificationType) {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_NOT_CONFIGURED");
  await getDb()
    .delete(coachVerifications)
    .where(and(eq(coachVerifications.coachId, coachId), eq(coachVerifications.type, type)));
}
