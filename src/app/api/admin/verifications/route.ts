import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import { requireExecutive } from "@/lib/auth-server";
import { logAdminAction } from "@/lib/admin/audit";
import {
  deleteVerification,
  isVerificationStatus,
  isVerificationType,
  listCoachVerificationStatus,
  listVerifications,
  recordVerification,
} from "@/lib/admin/verifications";

function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "FAILED";
  if (message === "UNAUTHORIZED") return NextResponse.json({ error: message }, { status: 401 });
  if (message === "FORBIDDEN") return NextResponse.json({ error: message }, { status: 403 });
  if (message === "COACH_NOT_FOUND") return NextResponse.json({ error: message }, { status: 404 });
  if (message === "DATABASE_NOT_CONFIGURED") {
    return NextResponse.json({ error: message }, { status: 503 });
  }
  return NextResponse.json({ error: "FAILED" }, { status: 500 });
}

/** `?coachId=` returns that coach's checks; otherwise the roster with badge state. */
export async function GET(req: Request) {
  try {
    await requireExecutive();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }
    const coachId = new URL(req.url).searchParams.get("coachId");
    if (coachId) {
      return NextResponse.json({ verifications: await listVerifications(coachId) });
    }
    return NextResponse.json({ coaches: await listCoachVerificationStatus() });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Record (or re-record) the outcome of one check. */
export async function POST(req: Request) {
  try {
    const admin = await requireExecutive();
    const body = (await req.json().catch(() => ({}))) as {
      coachId?: string;
      type?: string;
      status?: string;
      provider?: string;
      reference?: string;
      notes?: string;
      expiresAt?: string;
    };

    if (!body.coachId) return NextResponse.json({ error: "MISSING_COACH" }, { status: 400 });
    if (!isVerificationType(body.type)) {
      return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
    }
    if (!isVerificationStatus(body.status)) {
      return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
    }

    let expiresAt: Date | null | undefined;
    if (body.expiresAt) {
      const parsed = new Date(body.expiresAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "INVALID_EXPIRY" }, { status: 400 });
      }
      expiresAt = parsed;
    }

    const result = await recordVerification({
      coachId: body.coachId,
      type: body.type,
      status: body.status,
      provider: body.provider,
      reference: body.reference,
      notes: body.notes,
      expiresAt,
      recordedBy: admin.id,
    });

    await logAdminAction({
      adminUserId: admin.id,
      action: "verification.record",
      targetType: "coach",
      targetId: body.coachId,
      metadata: {
        type: body.type,
        status: body.status,
        provider: body.provider ?? null,
        reference: body.reference ?? null,
      },
    });

    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Remove a check filed in error. */
export async function DELETE(req: Request) {
  try {
    const admin = await requireExecutive();
    const url = new URL(req.url);
    const coachId = url.searchParams.get("coachId");
    const type = url.searchParams.get("type");
    if (!coachId) return NextResponse.json({ error: "MISSING_COACH" }, { status: 400 });
    if (!isVerificationType(type)) {
      return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
    }

    await deleteVerification(coachId, type);
    await logAdminAction({
      adminUserId: admin.id,
      action: "verification.delete",
      targetType: "coach",
      targetId: coachId,
      metadata: { type },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
