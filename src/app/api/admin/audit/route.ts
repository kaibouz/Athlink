import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { listAuditLog } from "@/lib/admin/data";

export async function GET() {
  try {
    await requireExecutive();
    const entries = await listAuditLog();
    return NextResponse.json({ entries });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  }
}
