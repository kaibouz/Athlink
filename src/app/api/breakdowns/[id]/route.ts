import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { canViewBreakdown, getBreakdownById } from "@/lib/server/athlete";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, breakdown] = await Promise.all([getRequestUser(), getBreakdownById(id)]);
  // Same 404 whether missing or not yours, so ids can't be probed.
  if (!breakdown || !(await canViewBreakdown(user, breakdown))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ breakdown });
}
