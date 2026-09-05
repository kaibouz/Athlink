import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { saveParentLink } from "@/lib/server/athlete";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = (await req.json()) as {
    guardianName?: string;
    guardianEmail?: string;
    relationship?: string;
  };
  if (!body.guardianEmail?.trim()) {
    return NextResponse.json({ error: "MISSING_EMAIL" }, { status: 400 });
  }
  const ok = await saveParentLink(user, {
    guardianName: body.guardianName,
    guardianEmail: body.guardianEmail,
    relationship: body.relationship,
  });
  if (!ok) {
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
