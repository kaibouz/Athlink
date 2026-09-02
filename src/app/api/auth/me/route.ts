import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { listBookingsForUser } from "@/lib/server/data";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ user: null, bookings: [] });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null, bookings: [] });
    }
    const bookings = await listBookingsForUser(user.id, user.role);
    return NextResponse.json({ user, bookings });
  } catch {
    return NextResponse.json({ user: null, bookings: [] });
  }
}
