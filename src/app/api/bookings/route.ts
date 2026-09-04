import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-user";
import { createBooking, listBookingsForUser } from "@/lib/server/data";
import type { Booking } from "@/types";

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const bookings = await listBookingsForUser(user.id, user.role);
  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json()) as Omit<Booking, "id" | "createdAt" | "status" | "athleteId" | "athleteName">;
  const booking = await createBooking(body, user.id, user.name);
  return NextResponse.json({ booking }, { status: 201 });
}
