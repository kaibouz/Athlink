import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth-server";

export async function POST() {
  try {
    if (process.env.DATABASE_URL) {
      await destroySession();
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
