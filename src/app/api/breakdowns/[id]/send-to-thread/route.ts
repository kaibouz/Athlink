import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { sendBreakdownToThread } from "@/lib/server/athlete";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  const result = await sendBreakdownToThread(id, user);
  if (!result) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(result, { status: 201 });
}
