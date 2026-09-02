import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: false,
      database: "not_configured",
      message: "Set DATABASE_URL in .env.local",
    });
  }

  try {
    const { getDb } = await import("@/db");
    const db = getDb();
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: err instanceof Error ? err.message : "Database connection failed",
      },
      { status: 503 },
    );
  }
}
