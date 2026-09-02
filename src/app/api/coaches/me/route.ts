import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getCoachAnalytics, getCoachByUserId } from "@/lib/server/data";

export async function GET() {
  const user = await getCurrentUser();
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
