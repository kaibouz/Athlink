import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { coachApplications } from "@/db/schema";
import { logAdminAction } from "@/lib/admin/audit";
import { requireExecutive } from "@/lib/auth-server";

export async function PATCH(req: Request) {
  try {
    const executive = await requireExecutive();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    const body = (await req.json()) as {
      id?: string;
      action?: "approve" | "reject" | "request_info";
      reason?: string;
    };

    if (!body.id || !body.action) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const db = getDb();
    const [app] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.id, body.id))
      .limit(1);

    if (!app) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const status =
      body.action === "approve"
        ? "approved"
        : body.action === "reject"
          ? "rejected"
          : "pending_info";

    await db
      .update(coachApplications)
      .set({
        status,
        notes: body.reason ?? app.notes,
        reviewedAt: new Date(),
        reviewedBy: executive.id,
      })
      .where(eq(coachApplications.id, body.id));

    await logAdminAction({
      adminUserId: executive.id,
      action: `coach_application.${body.action}`,
      targetType: "coach_application",
      targetId: body.id,
      metadata: { reason: body.reason },
    });

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "ACTION_FAILED" }, { status: 500 });
  }
}
