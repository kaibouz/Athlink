import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getPlatformStats } from "@/lib/server/data";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (user?.role === "executive") {
    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  }

  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_STATS_TOKEN;

  if (expected && token !== expected) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (process.env.NODE_ENV === "production" && !expected && !user) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const stats = await getPlatformStats();
  return NextResponse.json(stats);
}
