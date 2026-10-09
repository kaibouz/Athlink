import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { logAdminAction } from "@/lib/admin/audit";
import { getAdminUserDetail, setUserStatus } from "@/lib/admin/data";

type Ctx = { params: Promise<{ id: string }> };

function authError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return null;
}

/** Full registration record for one member (account + coach/athlete profile). */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }
    await requireExecutive();
    const { id } = await ctx.params;
    const detail = await getAdminUserDetail(id);
    if (!detail) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json(detail);
  } catch (err) {
    return authError(err) ?? NextResponse.json({ error: "DETAIL_FAILED" }, { status: 500 });
  }
}

/** Suspend or resume a member: body `{ action: "suspend" | "resume", reason?: string }`. */
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }
    const executive = await requireExecutive();
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { action?: string; reason?: string };

    if (body.action !== "suspend" && body.action !== "resume") {
      return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
    }

    const status = body.action === "suspend" ? "suspended" : "active";
    const result = await setUserStatus({
      userId: id,
      adminId: executive.id,
      status,
      reason: body.reason,
    });

    if (result === "not_found") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (result === "forbidden") return NextResponse.json({ error: "CANNOT_MODIFY_THIS_USER" }, { status: 403 });

    await logAdminAction({
      adminUserId: executive.id,
      action: `user.${body.action}`,
      targetType: "user",
      targetId: id,
      metadata: body.reason ? { reason: body.reason } : undefined,
    });

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    return authError(err) ?? NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
