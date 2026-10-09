import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";
import { listBookingsForUser } from "@/lib/server/data";
import { withResolvedPlan } from "@/lib/server/plan";
import type { Booking, User } from "@/types";

const EMPTY = { user: null, bookings: [] as Booking[], authSource: null };

/**
 * Two independent session systems answer here:
 *  1. athlink_session cookie + bcrypt — executives only
 *  2. Clerk — canonical for every public member
 *
 * The cookie only wins for executives, so an admin browsing the platform keeps
 * their identity. A member holding a stale cookie from the retired password
 * sign-up would otherwise keep resolving to that dead identity for the cookie's
 * full 30 days, shadowing the Clerk account they just signed in with.
 */
export async function GET() {
  let user: User | null = null;
  let authSource: "session" | "clerk" | null = null;

  if (process.env.DATABASE_URL) {
    try {
      const sessionUser = await getCurrentUser();
      if (sessionUser?.role === "executive") {
        user = sessionUser;
        authSource = "session";
      }
    } catch {
      user = null;
    }
  }

  if (!user) {
    user = await getClerkSessionUser();
    if (user) authSource = "clerk";
  }

  if (!user) return NextResponse.json(EMPTY);

  user = await withResolvedPlan(user);

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
