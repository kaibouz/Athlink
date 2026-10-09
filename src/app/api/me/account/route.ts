import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth-server";
import { getRequestUser } from "@/lib/server/current-user";
import { deleteMemberAccount } from "@/lib/server/account-deletion";

/**
 * DELETE /api/me/account — the signed-in member deletes their own account.
 * Body: { "confirm": "DELETE" } so a stray request cannot wipe an account.
 */
export async function DELETE(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "CONFIRMATION_REQUIRED" }, { status: 400 });
  }

  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const result = await deleteMemberAccount(user.id);

    // Remove the Clerk identity too, so the same login cannot silently re-create the account.
    if (result.clerkId && process.env.CLERK_SECRET_KEY) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        await client.users.deleteUser(result.clerkId);
      } catch (err) {
        console.error("[account] Clerk user deletion failed", err);
      }
    }

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);

    return NextResponse.json({ ok: true, mode: result.mode });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EXECUTIVE_ACCOUNT") {
        return NextResponse.json({ error: "EXECUTIVE_ACCOUNT" }, { status: 403 });
      }
      if (err.message === "NOT_FOUND") {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      }
    }
    console.error("[account] deletion failed", err);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}
