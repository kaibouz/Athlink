import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import { requireExecutive } from "@/lib/auth-server";
import { listAthletesForAdmin } from "@/lib/admin/data";

export async function GET() {
  try {
    await requireExecutive();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED", athletes: [] }, { status: 503 });
    }
    const athletes = await listAthletesForAdmin();
    return NextResponse.json({ athletes });
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
