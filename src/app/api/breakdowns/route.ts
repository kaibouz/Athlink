import { NextResponse } from "next/server";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";
import { remainingAiBreakdowns } from "@/lib/platform-plans";
import { getBreakdownsForAthlete } from "@/lib/server/athlete";
import { createBreakdownJob, processBreakdown } from "@/lib/server/ai-breakdown";
import { audienceForUser, countAiBreakdownsThisMonth, resolveUserPlan } from "@/lib/server/plan";

async function resolveAuthedUser() {
  let user = null;
  if (process.env.DATABASE_URL) {
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }
  }
  if (!user) user = await getClerkSessionUser();
  return user;
}

export async function GET() {
  const user = await resolveAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const breakdowns = await getBreakdownsForAthlete(user.id);
  const plan = await resolveUserPlan(user);
  const used = await countAiBreakdownsThisMonth(user.id);
  const remaining = remainingAiBreakdowns(used, audienceForUser(user), plan);
  return NextResponse.json({ breakdowns, plan, usedThisMonth: used, remainingThisMonth: remaining });
}

/** Submit a clip for AI analysis. Returns the job immediately (status "processing"). */
export async function POST(req: Request) {
  const user = await resolveAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json({ error: "ATHLETE_ONLY" }, { status: 403 });
  }

  const plan = await resolveUserPlan(user);
  const audience = audienceForUser(user);
  const used = await countAiBreakdownsThisMonth(user.id);
  const remaining = remainingAiBreakdowns(used, audience, plan);
  if (remaining !== null && remaining <= 0) {
    return NextResponse.json(
      {
        error: "PLAN_LIMIT",
        plan,
        usedThisMonth: used,
        remainingThisMonth: 0,
        upgradeRequired: true,
      },
      { status: 402 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    clipUrl?: string;
    posterUrl?: string;
    analysisType?: string;
    sport?: string;
    position?: string;
    notes?: string;
  };
  if (!body.clipUrl?.trim()) {
    return NextResponse.json({ error: "MISSING_CLIP" }, { status: 400 });
  }

  const job = await createBreakdownJob(user, {
    clipUrl: body.clipUrl.trim(),
    posterUrl: body.posterUrl?.trim() || undefined,
    analysisType: body.analysisType === "pitching" ? "pitching" : "swing",
    sport: body.sport?.trim() || undefined,
    position: body.position?.trim() || undefined,
    notes: body.notes?.trim() || undefined,
  });

  // Run the analysis after the response is flushed (production-style async job).
  after(async () => {
    try {
      await processBreakdown(job.id);
    } catch {
      /* processBreakdown persists its own error state */
    }
  });

  return NextResponse.json(
    {
      breakdown: job,
      plan,
      usedThisMonth: used + 1,
      remainingThisMonth: remaining === null ? null : Math.max(0, remaining - 1),
    },
    { status: 202 },
  );
}
