import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  adminAlerts,
  adminAuditLog,
  athleteProfiles,
  bookings,
  coachProfiles,
  featureFlags,
  messageThreads,
  parentLinks,
  sessions,
  users,
} from "@/db/schema";

export async function getAdminOverview() {
  if (!isDatabaseConfigured()) {
    return {
      signups: { coach: 0, athlete: 0, total: 0, delta7d: 0 },
      sessions: { booked: 0, completed: 0, cancelled: 0, pending: 0 },
      users: { total: 0, coaches: 0, athletes: 0, executives: 0 },
      alertsOpen: 0,
      suspended: 0,
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
    [suspendedCount],
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
    db.select({ n: count() }).from(users).where(eq(users.status, "suspended")),
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
    suspended: suspendedCount?.n ?? 0,
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
      sport: coachProfiles.sport,
      createdAt: coachProfiles.createdAt,
      status: users.status,
    })
    .from(coachProfiles)
    .innerJoin(users, eq(coachProfiles.userId, users.id))
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
      school: athleteProfiles.school,
      lookingForCoach: athleteProfiles.lookingForCoach,
      openToScouts: athleteProfiles.openToScouts,
      createdAt: users.createdAt,
      status: users.status,
    })
    .from(athleteProfiles)
    .innerJoin(users, eq(athleteProfiles.userId, users.id))
    .orderBy(desc(users.createdAt))
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

/** Everything an executive needs to review one registered member. */
export async function getAdminUserDetail(userId: string) {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      statusReason: users.statusReason,
      statusChangedAt: users.statusChangedAt,
      createdAt: users.createdAt,
      signInMethod: sql<string>`case when ${users.clerkId} is null then 'password' else 'clerk' end`,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return null;

  const [coach] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, userId)).limit(1);
  const [athlete] = await db.select().from(athleteProfiles).where(eq(athleteProfiles.userId, userId)).limit(1);
  const guardians = await db.select().from(parentLinks).where(eq(parentLinks.athleteId, userId));

  const bookingFilter = coach ? eq(bookings.coachId, coach.id) : eq(bookings.athleteId, userId);
  const [bookingCount] = await db.select({ n: count() }).from(bookings).where(bookingFilter);
  const recentBookings = await db
    .select({
      id: bookings.id,
      date: bookings.date,
      startTime: bookings.startTime,
      coachName: bookings.coachName,
      athleteName: bookings.athleteName,
      price: bookings.price,
      status: bookings.status,
    })
    .from(bookings)
    .where(bookingFilter)
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  return {
    user,
    coach: coach ?? null,
    athlete: athlete ?? null,
    guardians,
    bookings: { total: bookingCount?.n ?? 0, recent: recentBookings },
  };
}

/**
 * Suspend / resume a member. Suspended accounts cannot sign in, disappear from
 * search, and cannot be booked. Executives can never be suspended here.
 */
export async function setUserStatus(input: {
  userId: string;
  adminId: string;
  status: "active" | "suspended";
  reason?: string;
}): Promise<"ok" | "not_found" | "forbidden"> {
  if (input.userId === input.adminId) return "forbidden";
  const db = getDb();
  const [target] = await db
    .select({ id: users.id, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);
  if (!target) return "not_found";
  if (target.role === "executive" || target.status === "deleted") return "forbidden";

  const now = new Date();
  await db
    .update(users)
    .set({
      status: input.status,
      statusReason: input.status === "suspended" ? input.reason?.trim() || null : null,
      statusChangedAt: now,
      updatedAt: now,
    })
    .where(eq(users.id, input.userId));

  if (input.status === "suspended") {
    // End every existing cookie session immediately.
    await db.delete(sessions).where(eq(sessions.userId, input.userId));
  }
  return "ok";
}
