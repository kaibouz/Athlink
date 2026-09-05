import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getStudentsForCoach } from "@/lib/server/athlete";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }
  const students = await getStudentsForCoach(user);
  return NextResponse.json({ students });
}
