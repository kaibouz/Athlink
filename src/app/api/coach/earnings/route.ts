import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getCoachEarnings } from "@/lib/server/athlete";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }
  const earnings = await getCoachEarnings(user);
  return NextResponse.json({ earnings });
}
