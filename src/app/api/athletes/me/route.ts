import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { upsertAthleteProfile, type AthleteProfileInput } from "@/lib/server/athlete";

/** Save the signed-in athlete's registration profile (athlete_profiles). */
export async function POST(req: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json({ error: "ATHLETE_ONLY" }, { status: 403 });
  }

  let body: Partial<AthleteProfileInput>;
  try {
    body = (await req.json()) as Partial<AthleteProfileInput>;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  if (!body.school?.trim() || !body.classYear?.trim() || !body.position?.trim() || !body.location?.trim()) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const result = await upsertAthleteProfile(user, body as AthleteProfileInput);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (err) {
    if (err instanceof Error && err.message === "DATABASE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
