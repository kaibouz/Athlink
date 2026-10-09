import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { getCoachAnalytics, getCoachByUserId } from "@/lib/server/data";

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
