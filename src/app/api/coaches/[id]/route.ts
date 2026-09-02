import { NextResponse } from "next/server";
import { getCoachById, getReviewsByCoach, getSlotsByCoach } from "@/lib/server/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const coach = await getCoachById(id);
  if (!coach) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  const [reviews, slots] = await Promise.all([
    getReviewsByCoach(id),
    getSlotsByCoach(id),
  ]);
  return NextResponse.json({ coach, reviews, slots });
}
