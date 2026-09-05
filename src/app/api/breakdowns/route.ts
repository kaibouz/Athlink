import { NextResponse } from "next/server";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getBreakdownsForAthlete } from "@/lib/server/athlete";
import { createBreakdownJob, processBreakdown } from "@/lib/server/ai-breakdown";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const breakdowns = await getBreakdownsForAthlete(user.id);
  return NextResponse.json({ breakdowns });
}

/** Submit a clip for AI analysis. Returns the job immediately (status "processing"). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json({ error: "ATHLETE_ONLY" }, { status: 403 });
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

  return NextResponse.json({ breakdown: job }, { status: 202 });
}
