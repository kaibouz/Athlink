import { NextResponse } from "next/server";
import { getCurrentUser, PUBLIC_SIGNUP_ROLES, registerUser } from "@/lib/auth-server";
import type { UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
      role?: UserRole;
    };

    if (!body.email || !body.password || !body.name || !body.role) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    if (!PUBLIC_SIGNUP_ROLES.includes(body.role)) {
      return NextResponse.json({ error: "ROLE_FORBIDDEN" }, { status: 403 });
    }

    const user = await registerUser({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }
    if (err instanceof Error && err.message === "ROLE_FORBIDDEN") {
      return NextResponse.json({ error: "ROLE_FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "SIGNUP_FAILED" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
