import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { getMessagesForUser, sendMessage } from "@/lib/server/athlete";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { threads, messages } = await getMessagesForUser(user);
  return NextResponse.json({ threads, messages });
}

export async function POST(req: Request) {
  const user = await getRequestUser();
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
  try {
    const message = await sendMessage(user, {
      threadId: body.threadId,
      body: body.body.trim().slice(0, 4000),
      kind: body.kind === "clip" ? "clip" : "text",
      attachmentUrl: body.attachmentUrl,
      breakdownId: body.breakdownId,
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "SEND_FAILED" }, { status: 500 });
  }
}
