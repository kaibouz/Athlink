import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { createFeedback, getFeedbackForCoach } from "@/lib/server/athlete";
import { getCoachByUserId } from "@/lib/server/data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }
  const coach = await getCoachByUserId(user.id);
  if (!coach) {
    return NextResponse.json({ feedback: [] });
  }
  const feedback = await getFeedbackForCoach(coach.id);
  return NextResponse.json({ feedback });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }
  const body = (await req.json()) as {
    studentId?: string;
    subject?: string;
    body?: string;
    aiAttached?: boolean;
  };
  if (!body.studentId || !body.subject?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  const report = await createFeedback(user, {
    studentId: body.studentId,
    subject: body.subject.trim(),
    body: body.body.trim(),
    aiAttached: body.aiAttached,
  });
  if (!report) {
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 400 });
  }
  return NextResponse.json({ report }, { status: 201 });
}
