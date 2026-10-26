import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { recentErrors } from "@/lib/server/error-log";

/** Latest server errors recorded by logError(). */
export async function GET() {
  try {
    await requireExecutive();
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNAUTHORIZED";
    return NextResponse.json({ error: code }, { status: code === "FORBIDDEN" ? 403 : 401 });
  }
  const errors = await recentErrors(100);
  return NextResponse.json({ errors: errors.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })) });
}
