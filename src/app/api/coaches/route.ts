import { NextResponse } from "next/server";
import { listCoaches } from "@/lib/server/data";

export async function GET() {
  const coaches = await listCoaches();
  return NextResponse.json({ coaches });
}
