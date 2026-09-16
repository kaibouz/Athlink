import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { CLERK_ASSIGNABLE_ROLES, setClerkUserRole } from "@/lib/clerk-auth-server";
import type { UserRole } from "@/types";

/**
 * Sets the app-side role for the signed-in Clerk member (athlete / coach /
 * parent). Deliberately refuses to run for athlink_session holders so the
 * admin/executive path keeps its role assignment exclusively in the DB.
 */
export async function POST(request: Request) {
  let body: { role?: string };
  try {
    body = (await request.json()) as { role?: string };
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const role = body.role as UserRole | undefined;
  if (!role || !CLERK_ASSIGNABLE_ROLES.includes(role)) {
    return NextResponse.json({ error: "ROLE_FORBIDDEN" }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const sessionUser = await getCurrentUser();
      if (sessionUser) {
        return NextResponse.json({ error: "SESSION_ROLE_IMMUTABLE" }, { status: 409 });
      }
    } catch {
      /* fall through to Clerk */
    }
  }

  const user = await setClerkUserRole(role);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  return NextResponse.json({ user });
}
