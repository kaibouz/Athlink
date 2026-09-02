import { NextResponse } from "next/server";
import { requireExecutive } from "@/lib/auth-server";
import { listBookingsForAdmin } from "@/lib/admin/data";

export async function GET() {
  try {
    await requireExecutive();
    const bookings = await listBookingsForAdmin();
    return NextResponse.json({ bookings });
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
