import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { getCoachEarnings } from "@/lib/server/athlete";

export async function GET() {
  const user = await getRequestUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }
  const earnings = await getCoachEarnings(user);
  return NextResponse.json({ earnings });
}
