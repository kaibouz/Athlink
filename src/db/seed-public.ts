/**
 * Production-safe seed: the public catalogue only.
 *
 *   DATABASE_URL=... npm run db:seed:public
 *
 * Unlike seed.ts this never truncates, creates no executive account, and
 * gives demo users a random password that is neither printed nor stored —
 * the shared DEMO_PASSWORD lives in a public repo, so seeding it into a live
 * database would hand out logins. Members sign in with Clerk anyway.
 *
 * It also seeds no reviews and no coach_verifications rows: a "Verified"
 * badge on a public site must come from real checks recorded in the admin
 * console, not from fixtures.
 */
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "./index";
import { athleteProfiles, coachProfiles, featureFlags, socialPosts, users } from "./schema";
import { coaches } from "@/lib/data";
import { athleteProfiles as staticAthletes, seedSocialPosts } from "@/lib/social-data";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const db = getDb();
  // Unusable password: random, hashed, discarded.
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);

  const people = [
    ...coaches.map((c) => ({ id: c.userId, email: c.email.toLowerCase(), name: c.name, role: "coach" as const, avatarUrl: c.avatarUrl })),
    ...staticAthletes.map((a) => ({ id: a.userId, email: a.email.toLowerCase(), name: a.name, role: "athlete" as const, avatarUrl: a.avatarUrl })),
  ];
  const u = await db.insert(users).values(people.map((p) => ({ ...p, passwordHash }))).onConflictDoNothing().returning({ id: users.id });

  const cp = await db
    .insert(coachProfiles)
    .values(
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
        verified: false,
        formats: c.formats,
        avatarUrl: c.avatarUrl,
        coverGradient: c.coverGradient,
        career: c.career,
        languages: c.languages,
        availabilityNote: c.availabilityNote,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: coachProfiles.id });

  const ap = await db
    .insert(athleteProfiles)
    .values(
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
    )
    .onConflictDoNothing()
    .returning({ id: athleteProfiles.id });

  const sp = await db
    .insert(socialPosts)
    .values(
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
        coachName: p.coachName ?? null,
        sessionLabel: p.sessionLabel ?? null,
        breakdownId: null,
        metricChips: p.metricChips ?? null,
        createdAt: new Date(p.createdAt),
        likes: p.likes,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: socialPosts.id });

  const ff = await db
    .insert(featureFlags)
    .values(
      ["booking_flow", "training_feed", "ai_breakdown", "athlete_coach_messaging", "scout_discovery", "homepage_gateway"].map(
        (key) => ({ key, enabled: true, rolloutPercent: 100, audience: "all" }),
      ),
    )
    .onConflictDoNothing()
    .returning({ key: featureFlags.key });

  // Time slots are created on demand (rolling 14-day window) by the app.
  console.log(`users +${u.length}, coaches +${cp.length}, athletes +${ap.length}, posts +${sp.length}, flags +${ff.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
