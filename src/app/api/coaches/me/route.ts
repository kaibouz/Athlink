import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { getCoachAnalytics, getCoachByUserId, updateCoachProfile, type UpdateCoachInput } from "@/lib/server/data";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }

  const coach = await getCoachByUserId(user.id);
  if (!coach) {
    return NextResponse.json({ coach: null, analytics: null });
  }

  const analytics = await getCoachAnalytics(coach.id);
  return NextResponse.json({ coach, analytics });
}

/** Coach edits their own profile (validated field by field). */
export async function PATCH(req: Request) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as UpdateCoachInput | null;
  if (!body) return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  try {
    const coach = await updateCoachProfile(user.id, body);
    return NextResponse.json({ coach });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "NOT_FOUND") return NextResponse.json({ error: "NO_COACH_PROFILE" }, { status: 404 });
    if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });
    throw err;
  }
}
