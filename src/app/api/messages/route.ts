import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getMessagesForUser, sendMessage } from "@/lib/server/athlete";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { threads, messages } = await getMessagesForUser(user);
  return NextResponse.json({ threads, messages });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = (await req.json()) as {
    threadId?: string;
    body?: string;
    kind?: "text" | "clip";
    attachmentUrl?: string;
    breakdownId?: string;
  };
  if (!body.threadId || !body.body?.trim()) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  const message = await sendMessage(user, {
    threadId: body.threadId,
    body: body.body.trim(),
    kind: body.kind,
    attachmentUrl: body.attachmentUrl,
    breakdownId: body.breakdownId,
  });
  return NextResponse.json({ message }, { status: 201 });
}
