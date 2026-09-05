import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getAthleteProgress } from "@/lib/server/athlete";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const progress = await getAthleteProgress(user.id);
  return NextResponse.json({ progress });
}
