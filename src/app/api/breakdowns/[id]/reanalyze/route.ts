import { NextResponse } from "next/server";
import { AI_BREAKDOWN_ENABLED } from "@/lib/features";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { aiBreakdowns } from "@/db/schema";
import { getRequestUser } from "@/lib/server/current-user";
import { getBreakdownById } from "@/lib/server/athlete";
import { processBreakdown } from "@/lib/server/ai-breakdown";

/** Re-run analysis on an existing clip (resets the job to "processing"). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!AI_BREAKDOWN_ENABLED) {
    return NextResponse.json({ error: "FEATURE_DISABLED" }, { status: 404 });
  }
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DB_NOT_CONFIGURED" }, { status: 503 });
  }
  const existing = await getBreakdownById(id);
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (existing.athleteId !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const db = getDb();
  await db
    .update(aiBreakdowns)
    .set({ status: "processing", error: null })
    .where(eq(aiBreakdowns.id, id));

  after(async () => {
    try {
      await processBreakdown(id);
    } catch {
      /* processBreakdown persists its own error state */
    }
  });

  const breakdown = await getBreakdownById(id);
  return NextResponse.json({ breakdown }, { status: 202 });
}
