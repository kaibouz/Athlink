import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  adminAlerts,
  adminAuditLog,
  athleteProfiles,
  bookings,
  coachApplications,
  coachProfiles,
  featureFlags,
  messageThreads,
  users,
} from "@/db/schema";

export async function getAdminOverview() {
  if (!isDatabaseConfigured()) {
    return {
      signups: { coach: 0, athlete: 0, total: 0, delta7d: 0 },
      sessions: { booked: 0, completed: 0, cancelled: 0, pending: 0 },
      users: { total: 0, coaches: 0, athletes: 0, executives: 0 },
      alertsOpen: 0,
      applicationsPending: 0,
    };
  }

  const db = getDb();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    [totalUsers],
    [coachProfilesCount],
    [athleteCount],
    [executiveCount],
    [coachSignups7d],
    [athleteSignups7d],
    [bookingTotal],
    [bookingCompleted],
    [bookingCancelled],
    [bookingPending],
    [alertsOpen],
    [appsPending],
  ] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(coachProfiles),
    db.select({ n: count() }).from(athleteProfiles),
    db.select({ n: count() }).from(users).where(eq(users.role, "executive")),
    db
      .select({ n: count() })
      .from(users)
      .where(and(eq(users.role, "coach"), gte(users.createdAt, weekAgo))),
    db
      .select({ n: count() })
      .from(users)
      .where(and(eq(users.role, "athlete"), gte(users.createdAt, weekAgo))),
    db.select({ n: count() }).from(bookings),
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, "completed")),
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, "cancelled")),
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, "pending")),
    db.select({ n: count() }).from(adminAlerts).where(eq(adminAlerts.resolved, false)),
    db
      .select({ n: count() })
      .from(coachApplications)
      .where(eq(coachApplications.status, "pending")),
  ]);

  return {
    signups: {
      coach: coachSignups7d?.n ?? 0,
      athlete: athleteSignups7d?.n ?? 0,
      total: (coachSignups7d?.n ?? 0) + (athleteSignups7d?.n ?? 0),
      delta7d: (coachSignups7d?.n ?? 0) + (athleteSignups7d?.n ?? 0),
    },
    sessions: {
      booked: bookingTotal?.n ?? 0,
      completed: bookingCompleted?.n ?? 0,
      cancelled: bookingCancelled?.n ?? 0,
      pending: bookingPending?.n ?? 0,
    },
    users: {
      total: totalUsers?.n ?? 0,
      coaches: coachProfilesCount?.n ?? 0,
      athletes: athleteCount?.n ?? 0,
      executives: executiveCount?.n ?? 0,
    },
    alertsOpen: alertsOpen?.n ?? 0,
    applicationsPending: appsPending?.n ?? 0,
  };
}

export async function listAdminAlerts(limit = 10) {
  if (!isDatabaseConfigured()) return [];
  return getDb()
    .select()
    .from(adminAlerts)
    .orderBy(desc(adminAlerts.createdAt))
    .limit(limit);
}

export async function listCoachApplications(limit = 50) {
  if (!isDatabaseConfigured()) return [];
  return getDb()
    .select()
    .from(coachApplications)
    .orderBy(desc(coachApplications.submittedAt))
    .limit(limit);
}

export async function listCoachesForAdmin(limit = 100) {
  if (!isDatabaseConfigured()) return [];
  return getDb()
    .select({
      id: coachProfiles.id,
      userId: coachProfiles.userId,
      name: coachProfiles.name,
      email: coachProfiles.email,
      city: coachProfiles.city,
      specialties: coachProfiles.specialties,
      verified: coachProfiles.verified,
      pricePerHour: coachProfiles.pricePerHour,
      rating: coachProfiles.rating,
      reviewCount: coachProfiles.reviewCount,
      createdAt: coachProfiles.createdAt,
    })
    .from(coachProfiles)
    .orderBy(desc(coachProfiles.createdAt))
    .limit(limit);
}

export async function listAthletesForAdmin(limit = 100) {
  if (!isDatabaseConfigured()) return [];
  return getDb()
    .select({
      id: athleteProfiles.id,
      userId: athleteProfiles.userId,
      name: athleteProfiles.name,
      email: athleteProfiles.email,
      position: athleteProfiles.position,
      location: athleteProfiles.location,
      classYear: athleteProfiles.classYear,
      lookingForCoach: athleteProfiles.lookingForCoach,
    })
    .from(athleteProfiles)
    .orderBy(desc(athleteProfiles.id))
    .limit(limit);
}

export async function listBookingsForAdmin(limit = 200) {
  if (!isDatabaseConfigured()) return [];
  return getDb().select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit);
}

export async function listAuditLog(limit = 200) {
  if (!isDatabaseConfigured()) return [];
  return getDb()
    .select({
      id: adminAuditLog.id,
      adminUserId: adminAuditLog.adminUserId,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      metadata: adminAuditLog.metadata,
      createdAt: adminAuditLog.createdAt,
      adminName: users.name,
    })
    .from(adminAuditLog)
    .leftJoin(users, eq(adminAuditLog.adminUserId, users.id))
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(limit);
}

export async function listFeatureFlags() {
  if (!isDatabaseConfigured()) return [];
  return getDb().select().from(featureFlags).orderBy(featureFlags.key);
}

export async function getMessagingStats() {
  if (!isDatabaseConfigured()) return { threads: 0, unread: 0 };
  const db = getDb();
  const [threadCount] = await db.select({ n: count() }).from(messageThreads);
  const [unreadSum] = await db
    .select({ n: sql<number>`coalesce(sum(${messageThreads.unread}), 0)` })
    .from(messageThreads);
  return {
    threads: threadCount?.n ?? 0,
    unread: Number(unreadSum?.n ?? 0),
  };
}

export async function adminGlobalSearch(query: string) {
  if (!isDatabaseConfigured() || !query.trim()) {
    return { users: [], bookings: [] };
  }
  const db = getDb();
  const q = `%${query.trim()}%`;

  const userRows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(or(ilike(users.name, q), ilike(users.email, q)))
    .limit(8);

  const bookingRows = await db
    .select({
      id: bookings.id,
      coachName: bookings.coachName,
      athleteName: bookings.athleteName,
      status: bookings.status,
      date: bookings.date,
    })
    .from(bookings)
    .where(
      or(
        ilike(bookings.id, q),
        ilike(bookings.coachName, q),
        ilike(bookings.athleteName, q),
      ),
    )
    .limit(8);

  return { users: userRows, bookings: bookingRows };
}
