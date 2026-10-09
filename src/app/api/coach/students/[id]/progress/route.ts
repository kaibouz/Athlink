import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { getAthleteProgressForCoach } from "@/lib/server/athlete";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }
  const { id } = await params;
  const progress = await getAthleteProgressForCoach(user, id);
  return NextResponse.json({ progress });
}
