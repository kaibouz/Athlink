import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { featureFlags } from "@/db/schema";
import { logAdminAction } from "@/lib/admin/audit";
import { listFeatureFlags } from "@/lib/admin/data";
import { requireExecutive } from "@/lib/auth-server";

export async function GET() {
  try {
    await requireExecutive();
    const flags = await listFeatureFlags();
    return NextResponse.json({ flags });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const executive = await requireExecutive();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    const body = (await req.json()) as { key?: string; enabled?: boolean };
    if (!body.key || typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const db = getDb();
    await db
      .update(featureFlags)
      .set({ enabled: body.enabled, updatedAt: new Date() })
      .where(eq(featureFlags.key, body.key));

    await logAdminAction({
      adminUserId: executive.id,
      action: "feature_flag.update",
      targetType: "feature_flag",
      targetId: body.key,
      metadata: { enabled: body.enabled },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
