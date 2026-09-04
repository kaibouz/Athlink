import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";
import type { User } from "@/types";

/**
 * Resolves the signed-in product user for member APIs.
 * Prefer athlink_session (admin/executive + legacy) over Clerk so an
 * executive browsing the platform keeps their session identity.
 */
export async function getAppUser(): Promise<User | null> {
  if (process.env.DATABASE_URL) {
    try {
      const sessionUser = await getCurrentUser();
      if (sessionUser) return sessionUser;
    } catch {
      /* fall through to Clerk */
    }
  }
  return getClerkSessionUser();
}
