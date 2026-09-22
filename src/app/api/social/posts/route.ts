import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";
import {
  createSocialPostForUser,
  isSocialPostType,
  listAthleteProfiles,
  listSocialPosts,
} from "@/lib/server/social";

async function resolveAuthedUser() {
  let user = null;
  if (process.env.DATABASE_URL) {
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }
  }
  if (!user) user = await getClerkSessionUser();
  return user;
}

/** Public feed — demo seed + live member posts when DB is configured. */
export async function GET() {
  try {
    const [posts, profiles] = await Promise.all([listSocialPosts(), listAthleteProfiles()]);
    return NextResponse.json({ posts, profiles, source: "db" });
  } catch {
    return NextResponse.json({ posts: [], profiles: [], source: "unavailable" }, { status: 200 });
  }
}

/** Signed-in athlete publishes a clip to the training feed. */
export async function POST(req: Request) {
  const user = await resolveAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json({ error: "ATHLETE_ONLY" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    caption?: string;
    videoUrl?: string;
    posterUrl?: string;
    statsNote?: string;
    coachName?: string;
    sessionLabel?: string;
  };

  if (!isSocialPostType(body.type)) {
    return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
  }
  if (!body.caption?.trim()) {
    return NextResponse.json({ error: "MISSING_CAPTION" }, { status: 400 });
  }
  if (!body.videoUrl?.trim()) {
    return NextResponse.json({ error: "MISSING_VIDEO" }, { status: 400 });
  }

  try {
    const post = await createSocialPostForUser(user, {
      type: body.type,
      caption: body.caption,
      videoUrl: body.videoUrl,
      posterUrl: body.posterUrl,
      statsNote: body.statsNote,
      coachName: body.coachName,
      sessionLabel: body.sessionLabel,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "CREATE_FAILED";
    if (message === "DATABASE_NOT_CONFIGURED") {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
