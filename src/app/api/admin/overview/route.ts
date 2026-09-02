import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { getAdminOverview } from "@/lib/admin/data";

export async function GET() {
  try {
    await requireExecutive();
    const overview = await getAdminOverview();
    return NextResponse.json(overview);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      if (err.message === "FORBIDDEN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "OVERVIEW_FAILED" }, { status: 500 });
  }
}
