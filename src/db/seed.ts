/**
 * Seed the database with demo data from static lib files.
 * Run: npm run db:push && npm run db:seed
 */
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { getDb } from "./index";
import {
  athleteProfiles,
  bookings,
  coachFeedback,
  coachProfiles,
  messageThreads,
  messages,
  reviews,
  sessions,
  socialPosts,
  studentAthletes,
  timeSlots,
  users,
} from "./schema";
import {
  coaches,
  demoBookings,
  messageThreads as staticThreads,
  messages as staticMessages,
  reviews as staticReviews,
  timeSlots as staticSlots,
} from "@/lib/data";
import { athleteProfiles as staticAthletes, seedSocialPosts } from "@/lib/social-data";
import { seedFeedback, students } from "@/lib/coach-students";

const DEMO_PASSWORD = "Athlink2026!";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Copy .env.example to .env.local");
  }

  const db = getDb();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  console.log("Resetting tables…");
  await db.execute(sql`
    TRUNCATE TABLE
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

  console.log("Seeding users…");
  await db.insert(users).values([...coachUsers, ...athleteUsers, ...extraAthletes]);

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

  await db.insert(timeSlots).values(
    staticSlots.map((s) => ({
      id: s.id,
      coachId: s.coachId,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      available: s.available,
    })),
  );

  await db.insert(bookings).values(
    demoBookings.map((b) => ({
      id: b.id,
      coachId: b.coachId,
      coachName: b.coachName,
      athleteId: b.athleteId,
      athleteName: b.athleteName,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      format: b.format,
      packageType: b.packageType,
      price: b.price,
      status: b.status,
      note: b.note,
      createdAt: new Date(b.createdAt),
    })),
  );

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
      createdAt: new Date(p.createdAt),
      likes: p.likes,
    })),
  );

  console.log("Seeding coach students & feedback…");
  await db.insert(studentAthletes).values(
    students.map((s) => ({
      id: s.id,
      coachId: "c1",
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

  console.log("Done.");
  console.log("");
  console.log("Demo accounts (password for all):", DEMO_PASSWORD);
  console.log("  Coach:   tanaka@athlink.app");
  console.log("  Athlete: ethan.park@athlink.app");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
