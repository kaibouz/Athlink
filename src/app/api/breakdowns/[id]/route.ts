import { NextResponse } from "next/server";
import { getBreakdownById } from "@/lib/server/athlete";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const breakdown = await getBreakdownById(id);
  if (!breakdown) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ breakdown });
}
