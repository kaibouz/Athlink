import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { createBooking, listBookingsForUser } from "@/lib/server/data";
import type { Booking } from "@/types";

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

  const body = (await req.json()) as Omit<Booking, "id" | "createdAt" | "status" | "athleteId" | "athleteName">;
  try {
    const booking = await createBooking(body, user.id, user.name);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "COACH_UNAVAILABLE") {
      return NextResponse.json({ error: "COACH_UNAVAILABLE" }, { status: 404 });
    }
    return NextResponse.json({ error: "BOOKING_FAILED" }, { status: 500 });
  }
}
