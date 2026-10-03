import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { changeBookingStatus } from "@/lib/server/data";
import type { BookingStatus } from "@/types";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const ERROR_STATUS: Record<string, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  INVALID_TRANSITION: 409,
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: BookingStatus };
  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  try {
    await changeBookingStatus(id, body.status, { id: user.id, role: user.role });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code in ERROR_STATUS) {
      return NextResponse.json({ error: code }, { status: ERROR_STATUS[code] });
    }
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
