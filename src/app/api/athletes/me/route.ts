import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-user";
import {
  getAthleteProfileByUserId,
  upsertAthleteProfile,
  type UpsertAthleteProfileInput,
} from "@/lib/server/data";

/**
 * Member athlete profile — Postgres `athlete_profiles`.
 * Source: matching roadmap Foundation (CoachUp goal signals → looking_for_coach).
 * Phase: Foundation. Judgment: adopt.
 */
export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json({ error: "ATHLETE_ONLY" }, { status: 403 });
  }

  const athlete = await getAthleteProfileByUserId(user.id);
  return NextResponse.json({ athlete: athlete ?? null });
}

export async function PUT(req: Request) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json({ error: "ATHLETE_ONLY" }, { status: 403 });
  }

  let body: UpsertAthleteProfileInput;
  try {
    body = (await req.json()) as UpsertAthleteProfileInput;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.school?.trim() || !body.position?.trim() || !body.classYear?.trim()) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const athlete = await upsertAthleteProfile(user.id, user.email, user.avatarUrl, body);
    return NextResponse.json({ athlete });
  } catch (err) {
    if (err instanceof Error && err.message === "DATABASE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }
    return NextResponse.json({ error: "UPSERT_FAILED" }, { status: 500 });
  }
}
