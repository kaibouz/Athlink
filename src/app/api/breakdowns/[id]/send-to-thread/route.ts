import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { sendBreakdownToThread } from "@/lib/server/athlete";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  let result: Awaited<ReturnType<typeof sendBreakdownToThread>>;
  try {
    result = await sendBreakdownToThread(id, user);
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    throw err;
  }
  if (!result) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(result, { status: 201 });
}
