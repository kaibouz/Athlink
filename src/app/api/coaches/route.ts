import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-user";
import { createCoachProfile, listCoaches } from "@/lib/server/data";
import type { RegisterCoachInput } from "@/lib/server/data";

export async function GET() {
  const coaches = await listCoaches();
  return NextResponse.json({ coaches });
}

export async function POST(req: Request) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "coach") {
    return NextResponse.json({ error: "COACH_ONLY" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as RegisterCoachInput;
    if (!body.name?.trim() || !body.sport || !body.specialty || !body.location) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }
    if (!body.languages?.length || !body.bio?.trim()) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const coach = await createCoachProfile(user.id, user.email, user.avatarUrl, {
      ...body,
      pricePerHour: Number(body.pricePerHour) || 80,
    });

    return NextResponse.json({ coach }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "DATABASE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }
    return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 500 });
  }
}
