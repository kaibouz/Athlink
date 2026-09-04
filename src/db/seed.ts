/**
 * Seed the database with demo data from static lib files.
 * Run: npm run db:push && npm run db:seed
 */
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { getDb } from "./index";
import {
  adminAlerts,
  aiBreakdowns,
  athleteGoals,
  athleteMetrics,
  athleteProfiles,
  bookings,
  coachApplications,
  coachFeedback,
  coachProfiles,
  featureFlags,
  messageThreads,
  messages,
  parentLinks,
  reviews,
  sessions,
  socialPosts,
  studentAthletes,
  timeSlots,
  users,
} from "./schema";
import {
  coaches,
  messageThreads as staticThreads,
  messages as staticMessages,
  reviews as staticReviews,
} from "@/lib/data";
import { athleteProfiles as staticAthletes, seedSocialPosts } from "@/lib/social-data";
import { seedFeedback, students } from "@/lib/coach-students";
import {
  aiBreakdownSeed,
  athleteGoalSeed,
  athleteMetricSeed,
  studentUserLinks,
} from "@/lib/athlete-data";

/** Concept: coach + session + breakdown tags on selected feed clips */
const POST_TAGS: Record<
  string,
  { coachName: string; sessionLabel: string; breakdownId?: string; metricChips?: { label: string; value: string }[] }
> = {
  p1: {
    coachName: "Shota Tanaka",
    sessionLabel: "Hitting · Jul 20",
    breakdownId: "bd-a1-1",
    metricChips: [
      { label: "Exit velo", value: "84 mph" },
      { label: "Attack angle", value: "8°" },
    ],
  },
  p2: {
    coachName: "Open to coaches",
    sessionLabel: "Bullpen · Jul 27",
    breakdownId: "bd-a2-1",
    metricChips: [{ label: "FB velo", value: "64 mph" }],
  },
};

const DEMO_PASSWORD = "Athlink2026!";

/** Date string N days from today (local midnight). Keeps demo slots/bookings always current. */
function dayOffset(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const SLOT_TIMES: [string, string][] = [
  ["09:00", "10:00"],
  ["10:30", "11:30"],
  ["13:00", "14:00"],
  ["15:00", "16:00"],
  ["17:00", "18:00"],
  ["18:30", "19:30"],
];

/** Fresh, today-relative availability for every coach (14-day rolling window). */
function generateSlots(coachIds: string[]) {
  const rows: (typeof timeSlots.$inferInsert)[] = [];
  coachIds.forEach((coachId) => {
    for (let d = 0; d < 14; d++) {
      const date = dayOffset(d);
      SLOT_TIMES.forEach(([startTime, endTime], ti) => {
        rows.push({
          id: `${coachId}-${date}-${startTime}`,
          coachId,
          date,
          startTime,
          endTime,
          // Deterministic but varied availability; keep some open every day
          available: (d * 7 + ti) % 3 !== 0,
        });
      });
    }
  });
  return rows;
}

/** Upcoming + recent bookings anchored to today so Home/Coach-Today/earnings all populate. */
function generateBookings(): (typeof bookings.$inferInsert)[] {
  const mk = (
    id: string,
    coachId: string,
    coachName: string,
    athleteId: string,
    athleteName: string,
    offset: number,
    startTime: string,
    endTime: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
    format: "in_person" | "online",
    price: number,
    packageType: "single" | "pack" | "subscription",
    note?: string,
  ): typeof bookings.$inferInsert => ({
    id,
    coachId,
    coachName,
    athleteId,
    athleteName,
    date: dayOffset(offset),
    startTime,
    endTime,
    format,
    packageType,
    price,
    status,
    note,
    createdAt: new Date(),
  });

  return [
    // Today — coach c1 run-sheet + athlete next session
    mk("b1", "c1", "Shota Tanaka", "u-athlete-1", "Ethan Park", 0, "17:00", "18:00", "confirmed", "in_person", 95, "single", "Review outside-pitch attack angle"),
    mk("b3", "c1", "Shota Tanaka", "u-athlete-2", "Sofia Reyes", 0, "15:00", "16:00", "confirmed", "in_person", 95, "single", "Bullpen — glove-side finish"),
    mk("b4", "c1", "Shota Tanaka", "u-athlete-3", "Kenji Nakamura", 0, "18:30", "19:30", "pending", "in_person", 70, "single", "Defense footwork"),
    // Upcoming
    mk("b5", "c1", "Shota Tanaka", "u-athlete-4", "Maya Chen", 1, "10:00", "11:00", "confirmed", "in_person", 95, "single", "Transfer + framing"),
    mk("b2", "c1", "Shota Tanaka", "u-athlete-1", "Ethan Park", 3, "16:00", "17:00", "pending", "in_person", 95, "single", "Barrel path progression"),
    mk("b6", "c5", "Naoki Sato", "u-athlete-1", "Ethan Park", 6, "19:00", "20:00", "pending", "online", 80, "single", "Video review session"),
    // Recent completed — earnings + history
    mk("b7", "c1", "Shota Tanaka", "u-athlete-1", "Ethan Park", -7, "17:00", "18:00", "completed", "in_person", 95, "single"),
    mk("b8", "c1", "Shota Tanaka", "u-athlete-2", "Sofia Reyes", -9, "15:00", "16:00", "completed", "in_person", 95, "single"),
    mk("b9", "c1", "Shota Tanaka", "u-athlete-4", "Maya Chen", -12, "10:00", "11:00", "completed", "in_person", 95, "single"),
    mk("b10", "c1", "Shota Tanaka", "u-athlete-1", "Ethan Park", -14, "17:00", "18:00", "completed", "in_person", 95, "single"),
  ];
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Copy .env.example to .env.local");
  }

  const db = getDb();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  console.log("Resetting tables…");
  await db.execute(sql`
    TRUNCATE TABLE
      admin_audit_log,
      admin_alerts,
      coach_applications,
      feature_flags,
      platform_config,
      ai_breakdowns,
      athlete_goals,
      athlete_metrics,
      parent_links,
      coach_feedback,
      student_athletes,
      social_posts,
      athlete_profiles,
      messages,
      message_threads,
      bookings,
      time_slots,
      reviews,
      coach_profiles,
      sessions,
      users
    RESTART IDENTITY CASCADE
  `);

  const coachUsers = coaches.map((c) => ({
    id: c.userId,
    email: c.email.toLowerCase(),
    passwordHash,
    name: c.name,
    role: "coach" as const,
    avatarUrl: c.avatarUrl,
  }));

  const athleteUsers = staticAthletes.map((a) => ({
    id: a.userId,
    email: a.email.toLowerCase(),
    passwordHash,
    name: a.name,
    role: "athlete" as const,
    avatarUrl: a.avatarUrl,
  }));

  const extraAthletes = [
    { id: "u-athlete-5", email: "liam.ortiz@athlink.app", name: "Liam Ortiz" },
  ].map((a) => ({
    ...a,
    passwordHash,
    role: "athlete" as const,
    avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(a.name)}`,
  }));

  const executiveUser = {
    id: "u-executive-1",
    email: "ceo@athlink.app",
    passwordHash,
    name: "AthLink Executive",
    role: "executive" as const,
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Executive",
  };

  console.log("Seeding users…");
  await db.insert(users).values([executiveUser, ...coachUsers, ...athleteUsers, ...extraAthletes]);

  console.log("Seeding coach profiles…");
  await db.insert(coachProfiles).values(
    coaches.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      email: c.email,
      sport: c.sport,
      specialties: c.specialties,
      bio: c.bio,
      location: c.location,
      city: c.city,
      prefecture: c.prefecture,
      experienceYears: c.experienceYears,
      pricePerHour: c.pricePerHour,
      rating: c.rating,
      reviewCount: c.reviewCount,
      verified: c.verified,
      formats: c.formats,
      avatarUrl: c.avatarUrl,
      coverGradient: c.coverGradient,
      career: c.career,
      languages: c.languages,
      availabilityNote: c.availabilityNote,
    })),
  );

  console.log("Seeding reviews, slots, bookings…");
  await db.insert(reviews).values(
    staticReviews.map((r) => ({
      id: r.id,
      coachId: r.coachId,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      athleteLevel: r.athleteLevel,
    })),
  );

  await db.insert(timeSlots).values(generateSlots(coaches.map((c) => c.id)));

  await db.insert(bookings).values(generateBookings());

  console.log("Seeding messages…");
  await db.insert(messageThreads).values(
    staticThreads.map((t) => ({
      id: t.id,
      coachId: t.coachId,
      coachName: t.coachName,
      athleteId: t.athleteId,
      athleteName: t.athleteName,
      lastMessage: t.lastMessage,
      updatedAt: new Date(t.updatedAt),
      unread: t.unread,
    })),
  );

  await db.insert(messages).values(
    staticMessages.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      senderId: m.senderId,
      senderName: m.senderName,
      senderNameKey: m.senderNameKey,
      body: m.body,
      createdAt: new Date(m.createdAt),
    })),
  );

  // Concept: clips attach into the thread (from the feed / camera roll / AI breakdown)
  await db.insert(messages).values([
    {
      id: "m-clip-1",
      threadId: "t1",
      senderId: "u-athlete-1",
      senderName: "you",
      senderNameKey: "you" as const,
      body: {
        en: "Sharing my swing breakdown — the attack-angle notes you mentioned.",
        ja: "スイング分析を共有します — 話していたアタックアングルのメモです。",
        es: "Comparto mi análisis de swing — las notas del ángulo de ataque.",
      },
      kind: "clip",
      attachmentUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      breakdownId: "bd-a1-1",
      createdAt: new Date("2026-07-26T18:05:00"),
    },
  ]);

  console.log("Seeding athlete profiles & social…");
  await db.insert(athleteProfiles).values(
    staticAthletes.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: a.name,
      email: a.email,
      school: a.school,
      classYear: a.classYear,
      height: a.height,
      weight: a.weight,
      position: a.position,
      batsThrows: a.batsThrows,
      location: a.location,
      bio: a.bio,
      avatarUrl: a.avatarUrl,
      seasonStats: a.seasonStats,
      lookingForCoach: a.lookingForCoach,
      openToScouts: a.openToScouts,
    })),
  );

  await db.insert(socialPosts).values(
    seedSocialPosts.map((p) => ({
      id: p.id,
      athleteId: p.athleteId,
      athleteName: p.athleteName,
      school: p.school,
      position: p.position,
      classYear: p.classYear,
      avatarUrl: p.avatarUrl,
      type: p.type,
      caption: p.caption,
      videoUrl: p.videoUrl,
      posterUrl: p.posterUrl,
      statsNote: p.statsNote,
      coachName: POST_TAGS[p.id]?.coachName ?? null,
      sessionLabel: POST_TAGS[p.id]?.sessionLabel ?? null,
      breakdownId: POST_TAGS[p.id]?.breakdownId ?? null,
      metricChips: POST_TAGS[p.id]?.metricChips ?? null,
      createdAt: new Date(p.createdAt),
      likes: p.likes,
    })),
  );

  console.log("Seeding coach students & feedback…");
  await db.insert(studentAthletes).values(
    students.map((s) => ({
      id: s.id,
      coachId: "c1",
      userId: studentUserLinks[s.id] ?? null,
      name: s.name,
      age: s.age,
      level: s.level,
      position: s.position,
      parentName: s.parentName,
      location: s.location,
      avatarUrl: s.avatarUrl,
      lessonsCompleted: s.lessonsCompleted,
      nextLesson: s.nextLesson,
      focusAreas: s.focusAreas,
      aiSummary: s.aiSummary,
      strengths: s.strengths,
      improvements: s.improvements,
      metrics: s.metrics,
      history: s.history,
      lastSessionNote: s.lastSessionNote,
      lessonLog: s.lessonLog,
    })),
  );

  await db.insert(coachFeedback).values(
    seedFeedback.map((f) => ({
      id: f.id,
      coachId: "c1",
      studentId: f.studentId,
      studentName: f.studentName,
      subject: f.subject,
      body: f.body,
      createdAt: new Date(f.createdAt),
      aiAttached: f.aiAttached,
    })),
  );

  console.log("Seeding athlete metrics, goals & AI breakdowns…");
  await db.insert(athleteMetrics).values(
    athleteMetricSeed.map((m) => ({
      id: m.id,
      athleteId: m.athleteId,
      metric: m.metric,
      label: m.label,
      unit: m.unit,
      value: m.value,
      recordedAt: m.recordedAt,
    })),
  );

  await db.insert(athleteGoals).values(
    athleteGoalSeed.map((g) => ({
      id: g.id,
      athleteId: g.athleteId,
      metric: g.metric,
      label: g.label,
      unit: g.unit,
      position: g.position,
      baseline: g.baseline,
      current: g.current,
      target: g.target,
      priorityRank: g.priorityRank,
    })),
  );

  await db.insert(aiBreakdowns).values(
    aiBreakdownSeed.map((b) => ({
      id: b.id,
      athleteId: b.athleteId,
      coachId: b.coachId,
      coachName: b.coachName,
      title: b.title,
      videoUrl: b.videoUrl,
      posterUrl: b.posterUrl,
      status: b.status,
      processedSeconds: b.processedSeconds,
      pose: b.pose,
      flags: b.flags,
      metrics: b.metrics,
      summary: b.summary,
      threadId: b.threadId,
      sentToCoach: b.sentToCoach,
      createdAt: new Date(b.createdAt),
    })),
  );

  await db.insert(parentLinks).values([
    {
      id: "pl-1",
      athleteId: "u-athlete-1",
      guardianName: "Jennifer Park",
      guardianEmail: "jennifer.park@example.com",
      relationship: "parent",
      status: "linked",
    },
  ]);

  console.log("Seeding admin data…");
  await db.insert(featureFlags).values([
    { key: "booking_flow", enabled: true, rolloutPercent: 100, audience: "all" },
    { key: "training_feed", enabled: true, rolloutPercent: 100, audience: "all" },
    { key: "ai_breakdown", enabled: true, rolloutPercent: 100, audience: "all" },
    { key: "athlete_coach_messaging", enabled: true, rolloutPercent: 100, audience: "all" },
    { key: "scout_discovery", enabled: true, rolloutPercent: 100, audience: "all" },
    { key: "homepage_gateway", enabled: true, rolloutPercent: 100, audience: "all" },
  ]);

  await db.insert(coachApplications).values([
    {
      id: "app-1",
      name: "Jordan Reyes",
      email: "jordan.reyes@example.com",
      area: "Hermosa Beach",
      specialty: "hitting",
      yearsExperience: 8,
      status: "pending",
    },
    {
      id: "app-2",
      name: "Sam Chen",
      email: "sam.chen@example.com",
      area: "Manhattan Beach",
      specialty: "pitching",
      yearsExperience: 12,
      status: "pending",
    },
  ]);

  await db.insert(adminAlerts).values([
    {
      id: "alert-1",
      kind: "coach_application",
      title: "New coach application",
      detail: "Jordan Reyes — Hermosa Beach",
      severity: "info",
    },
  ]);

  console.log("Done.");
  console.log("");
  console.log("Demo accounts (password for all):", DEMO_PASSWORD);
  console.log("  Executive: ceo@athlink.app");
  console.log("  Coach:   tanaka@athlink.app");
  console.log("  Athlete: ethan.park@athlink.app");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
