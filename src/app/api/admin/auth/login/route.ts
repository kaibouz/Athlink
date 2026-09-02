import { NextResponse } from "next/server";
import { loginExecutive } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    const body = (await req.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const user = await loginExecutive(body.email, body.password);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "INVALID_CREDENTIALS") {
        return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
      }
      if (err.message === "NOT_EXECUTIVE") {
        return NextResponse.json({ error: "NOT_EXECUTIVE" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "LOGIN_FAILED" }, { status: 500 });
  }
}
