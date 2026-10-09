import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { isPlatformPlanId, type PlatformPlanId } from "@/lib/platform-plans";
import { setPlanCookie, withResolvedPlan } from "@/lib/server/plan";

/**
 * Demo / MVP plan switcher. Sets athlink_plan cookie until Stripe is wired.
 * Body: { plan: "free" | "pro" }
 */
export async function POST(req: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { plan?: string };
  if (!isPlatformPlanId(body.plan)) {
    return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });
  }

  const plan = body.plan as PlatformPlanId;
  await setPlanCookie(plan);
  const next = await withResolvedPlan({ ...user, plan });
  return NextResponse.json({ user: next });
}

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const next = await withResolvedPlan(user);
  return NextResponse.json({ user: next });
}
