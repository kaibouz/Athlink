import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { saveOnboardingGoals } from "@/lib/server/athlete";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = (await req.json()) as {
    position?: string;
    goals?: { metric: string; label: string; unit: string; target: number }[];
  };
  const goals = Array.isArray(body.goals) ? body.goals : [];
  if (goals.length === 0) {
    return NextResponse.json({ error: "NO_GOALS" }, { status: 400 });
  }
  const count = await saveOnboardingGoals(user, {
    position: body.position ?? "",
    goals,
  });
  return NextResponse.json({ saved: count }, { status: 201 });
}
