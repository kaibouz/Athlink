import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-user";
import { updateBookingStatus } from "@/lib/server/data";
import type { BookingStatus } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { status?: BookingStatus };
  if (!body.status) {
    return NextResponse.json({ error: "MISSING_STATUS" }, { status: 400 });
  }

  await updateBookingStatus(id, body.status);
  return NextResponse.json({ ok: true });
}
