import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { createBooking, listBookingsForUser, type CreateBookingInput } from "@/lib/server/data";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const bookings = await listBookingsForUser(user.id, user.role);
  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Partial<CreateBookingInput> | null;
  if (!body?.coachId || !body.date || !body.startTime || !body.format || !body.packageType) {
    return NextResponse.json({ error: "INVALID_BOOKING" }, { status: 400 });
  }

  try {
    // Only the fields the athlete actually chooses are forwarded; price, coach
    // name and end time are filled in from the database.
    const booking = await createBooking(
      {
        coachId: body.coachId,
        date: body.date,
        startTime: body.startTime,
        format: body.format,
        packageType: body.packageType,
        note: typeof body.note === "string" ? body.note : undefined,
      },
      user.id,
      user.name,
    );
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    const status: Record<string, number> = {
      COACH_UNAVAILABLE: 404,
      SLOT_TAKEN: 409,
      SLOT_IN_PAST: 409,
      INVALID_DATE: 400,
      INVALID_FORMAT: 400,
      INVALID_PACKAGE: 400,
    };
    if (code in status) return NextResponse.json({ error: code }, { status: status[code] });
    return NextResponse.json({ error: "BOOKING_FAILED" }, { status: 500 });
  }
}
