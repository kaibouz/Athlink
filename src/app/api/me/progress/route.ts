import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { getAthleteProgress } from "@/lib/server/athlete";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const progress = await getAthleteProgress(user.id);
  return NextResponse.json({ progress });
}
