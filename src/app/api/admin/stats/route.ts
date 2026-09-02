import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { getPlatformStats } from "@/lib/server/data";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    await requireExecutive();
    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      if (err.message === "FORBIDDEN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "STATS_FAILED" }, { status: 500 });
  }
}
