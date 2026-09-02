import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { recordAnalyticsEvent } from "@/lib/server/data";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    coachId?: string;
    path?: string;
    props?: Record<string, string>;
  };

  if (!body.name) {
    return NextResponse.json({ error: "MISSING_NAME" }, { status: 400 });
  }

  const user = await getCurrentUser();

  await recordAnalyticsEvent({
    name: body.name,
    userId: user?.id,
    coachId: body.coachId,
    path: body.path,
    props: body.props,
  });

  return NextResponse.json({ ok: true });
}
