import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { getMessagingStats } from "@/lib/admin/data";

export async function GET() {
  try {
    await requireExecutive();
    const stats = await getMessagingStats();
    return NextResponse.json(stats);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "STATS_FAILED" }, { status: 500 });
  }
}
