import { NextResponse, after } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { changeBookingStatus, recordAnalyticsEvent } from "@/lib/server/data";
import { notifyBooking } from "@/lib/server/notify";
import { logError } from "@/lib/server/error-log";
import type { Booking, BookingStatus } from "@/types";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled", "declined"];

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
    const row = await changeBookingStatus(id, body.status, { id: user.id, role: user.role });
    const booking = { ...row, location: row.location ?? undefined, note: row.note ?? undefined, createdAt: row.createdAt.toISOString() } as Booking;
    const next = body.status;
    after(async () => {
      await recordAnalyticsEvent({ name: `booking_${next}`, userId: user.id, coachId: row.coachId });
      if (next === "confirmed" || next === "declined" || next === "cancelled") {
        await notifyBooking(next, booking, row.athleteId === user.id ? "athlete" : "coach");
      }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code in ERROR_STATUS) {
      return NextResponse.json({ error: code }, { status: ERROR_STATUS[code] });
    }
    await logError("PATCH /api/bookings/[id]", err, { path: `/api/bookings/${id}`, userId: user.id });
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
