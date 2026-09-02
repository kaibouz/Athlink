import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { getCachedHealthChecks } from "@/lib/admin/health";

export async function GET() {
  try {
    await requireExecutive();
    const checks = await getCachedHealthChecks();
    return NextResponse.json({ checks });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      if (err.message === "FORBIDDEN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "HEALTH_FAILED" }, { status: 500 });
  }
}
