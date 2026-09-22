import { randomBytes } from "crypto";
import { desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { athleteProfiles, socialPosts } from "@/db/schema";
import type { AthletePublicProfile, SocialPost, SocialPostType, User } from "@/types";

const POST_TYPES: SocialPostType[] = ["form", "practice", "game", "training", "highlight"];

export function isSocialPostType(value: unknown): value is SocialPostType {
  return typeof value === "string" && POST_TYPES.includes(value as SocialPostType);
}

function mapPost(row: typeof socialPosts.$inferSelect): SocialPost {
  return {
    id: row.id,
    athleteId: row.athleteId,
    athleteName: row.athleteName,
    school: row.school,
    position: row.position,
    classYear: row.classYear,
    avatarUrl: row.avatarUrl,
    type: row.type as SocialPostType,
    caption: row.caption,
    videoUrl: row.videoUrl,
    posterUrl: row.posterUrl,
    statsNote: row.statsNote ?? undefined,
    coachName: row.coachName ?? undefined,
    sessionLabel: row.sessionLabel ?? undefined,
    breakdownId: row.breakdownId ?? undefined,
    metricChips: row.metricChips ?? undefined,
    createdAt: row.createdAt.toISOString(),
    likes: row.likes,
  };
}

function mapProfile(row: typeof athleteProfiles.$inferSelect): AthletePublicProfile {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    email: row.email,
    school: row.school,
    classYear: row.classYear,
    height: row.height,
    weight: row.weight,
    position: row.position,
    batsThrows: row.batsThrows,
    location: row.location,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    seasonStats: row.seasonStats as AthletePublicProfile["seasonStats"],
    lookingForCoach: row.lookingForCoach,
    openToScouts: row.openToScouts,
  };
}

export async function listSocialPosts(limit = 80): Promise<SocialPost[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(socialPosts)
    .orderBy(desc(socialPosts.createdAt))
    .limit(Math.min(200, Math.max(1, limit)));
  return rows.map(mapPost);
}

export async function listAthleteProfiles(): Promise<AthletePublicProfile[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const rows = await db.select().from(athleteProfiles);
  return rows.map(mapProfile);
}

/** Ensure the signed-in athlete has a public profile row (required FK for posts). */
export async function ensureAthleteProfileForUser(user: User): Promise<AthletePublicProfile> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }
  const db = getDb();
  const [existing] = await db
    .select()
    .from(athleteProfiles)
    .where(eq(athleteProfiles.userId, user.id))
    .limit(1);
  if (existing) return mapProfile(existing);

  const id = `a-${randomBytes(6).toString("hex")}`;
  const year = String(new Date().getFullYear() + 2);
  const row = {
    id,
    userId: user.id,
    name: user.name,
    email: user.email,
    school: "—",
    classYear: year,
    height: "—",
    weight: "—",
    position: "Athlete",
    batsThrows: "R/R",
    location: "—",
    bio: "",
    avatarUrl:
      user.avatarUrl ??
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email)}`,
    seasonStats: { seasonLabel: `${year} season` },
    lookingForCoach: true,
    openToScouts: false,
  };
  await db.insert(athleteProfiles).values(row);
  return mapProfile(row as typeof athleteProfiles.$inferSelect);
}

export type CreateSocialPostInput = {
  type: SocialPostType;
  caption: string;
  videoUrl: string;
  posterUrl?: string;
  statsNote?: string;
  coachName?: string;
  sessionLabel?: string;
};

export async function createSocialPostForUser(
  user: User,
  input: CreateSocialPostInput,
): Promise<SocialPost> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_NOT_CONFIGURED");
  if (user.role !== "athlete") {
    throw new Error("ATHLETE_ONLY");
  }

  const profile = await ensureAthleteProfileForUser(user);
  const caption = input.caption.trim();
  const videoUrl = input.videoUrl.trim();
  if (!caption) throw new Error("MISSING_CAPTION");
  if (!videoUrl) throw new Error("MISSING_VIDEO");

  const db = getDb();
  const id = `p-${randomBytes(6).toString("hex")}`;
  const createdAt = new Date();
  const posterUrl =
    input.posterUrl?.trim() ||
    "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80";

  const row = {
    id,
    athleteId: profile.id,
    athleteName: profile.name,
    school: profile.school,
    position: profile.position,
    classYear: profile.classYear,
    avatarUrl: profile.avatarUrl,
    type: input.type,
    caption,
    videoUrl,
    posterUrl,
    statsNote: input.statsNote?.trim() || null,
    coachName: input.coachName?.trim() || null,
    sessionLabel: input.sessionLabel?.trim() || null,
    breakdownId: null,
    metricChips: null,
    createdAt,
    likes: 0,
  };

  await db.insert(socialPosts).values(row);
  return mapPost(row as typeof socialPosts.$inferSelect);
}
