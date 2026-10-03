import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";
import type { User } from "@/types";

/**
 * Resolve the signed-in member for API routes.
 *
 * Two session systems coexist: the athlink_session cookie (executives) and
 * Clerk (canonical for every public member). Mirrors /api/auth/me — the cookie
 * only wins for executives so a stale one cannot shadow a Clerk member's real
 * account. Suspended accounts resolve to null.
 */
export async function getRequestUser(): Promise<User | null> {
  if (process.env.DATABASE_URL) {
    try {
      const user = await getCurrentUser();
      if (user?.role === "executive") return user;
    } catch {
      /* fall through to Clerk */
    }
  }
  return getClerkSessionUser();
}
