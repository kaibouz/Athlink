import { NextResponse } from "next/server";
import { AI_BREAKDOWN_ENABLED } from "@/lib/features";
import { getRequestUser } from "@/lib/server/current-user";
import { canViewBreakdown, getBreakdownById } from "@/lib/server/athlete";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!AI_BREAKDOWN_ENABLED) {
    return NextResponse.json({ error: "FEATURE_DISABLED" }, { status: 404 });
  }
  const { id } = await params;
  const [user, breakdown] = await Promise.all([getRequestUser(), getBreakdownById(id)]);
  // Same 404 whether missing or not yours, so ids can't be probed.
  if (!breakdown || !(await canViewBreakdown(user, breakdown))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ breakdown });
}
