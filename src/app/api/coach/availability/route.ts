import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import {
  getAvailabilityTemplate,
  getCoachByUserId,
  setAvailabilityTemplate,
  type AvailabilityBlock,
} from "@/lib/server/data";
import { AVAILABILITY_BLOCKS } from "@/lib/coach-taxonomy";

async function myCoachId() {
  const user = await getRequestUser();
  if (!user) return { error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  const coach = await getCoachByUserId(user.id);
  if (!coach) return { error: NextResponse.json({ error: "COACH_ONLY" }, { status: 403 }) };
  return { coachId: coach.id };
}

/** The signed-in coach's weekly availability template. */
export async function GET() {
  const me = await myCoachId();
  if ("error" in me) return me.error;
  return NextResponse.json({ blocks: await getAvailabilityTemplate(me.coachId) });
}

/** Replace the weekly template; upcoming bookable times are rebuilt from it. */
export async function PUT(req: Request) {
  const me = await myCoachId();
  if ("error" in me) return me.error;
  const body = (await req.json().catch(() => null)) as { blocks?: AvailabilityBlock[] } | null;
  const allowed = new Map(AVAILABILITY_BLOCKS.map(([s, e]) => [s, e]));
  const seen = new Set<string>();
  const blocks: AvailabilityBlock[] = [];
  for (const b of body?.blocks ?? []) {
    const ok = Number.isInteger(b?.weekday) && b.weekday >= 0 && b.weekday <= 6 && allowed.get(b.startTime) === b.endTime;
    if (!ok) return NextResponse.json({ error: "INVALID_BLOCK" }, { status: 400 });
    const key = `${b.weekday}-${b.startTime}`;
    if (!seen.has(key)) {
      seen.add(key);
      blocks.push({ weekday: b.weekday, startTime: b.startTime, endTime: b.endTime });
    }
  }
  await setAvailabilityTemplate(me.coachId, blocks);
  return NextResponse.json({ blocks });
}
