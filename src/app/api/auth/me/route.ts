import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";
import { listBookingsForUser } from "@/lib/server/data";
import type { Booking, User } from "@/types";

const EMPTY = { user: null, bookings: [] as Booking[], authSource: null };

/**
 * Two independent session systems answer here:
 *  1. athlink_session cookie + bcrypt (admin/executive, and legacy members)
 *  2. Clerk (canonical for public members)
 * The cookie wins when both are present so an executive browsing the platform
 * keeps their admin identity.
 */
export async function GET() {
  let user: User | null = null;
  let authSource: "session" | "clerk" | null = null;

  if (process.env.DATABASE_URL) {
    try {
      user = await getCurrentUser();
      if (user) authSource = "session";
    } catch {
      user = null;
    }
  }

  if (!user) {
    user = await getClerkSessionUser();
    if (user) authSource = "clerk";
  }

  if (!user) return NextResponse.json(EMPTY);

  let bookings: Booking[] = [];
  if (process.env.DATABASE_URL) {
    try {
      bookings = await listBookingsForUser(user.id, user.role);
    } catch {
      bookings = [];
    }
  }

  return NextResponse.json({ user, bookings, authSource });
}
