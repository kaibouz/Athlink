import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getBreakdownsForAthlete } from "@/lib/server/athlete";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const breakdowns = await getBreakdownsForAthlete(user.id);
  return NextResponse.json({ breakdowns });
}
