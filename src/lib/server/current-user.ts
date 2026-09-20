import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";
import type { User } from "@/types";

/**
 * Resolve the signed-in member for API routes.
 *
 * Two session systems coexist: the athlink_session cookie (password sign-up /
 * executives) and Clerk (canonical for public members). The cookie wins when
 * both are present, mirroring /api/auth/me. Suspended accounts resolve to null.
 */
export async function getRequestUser(): Promise<User | null> {
  if (process.env.DATABASE_URL) {
    try {
      const user = await getCurrentUser();
      if (user) return user;
    } catch {
      /* fall through to Clerk */
    }
  }
  return getClerkSessionUser();
}
