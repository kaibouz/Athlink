import { NextResponse } from "next/server";
import { registerExecutive, requireExecutive } from "@/lib/auth-server";
import { logAdminAction } from "@/lib/admin/audit";
import { listUsersForAdmin } from "@/lib/server/data";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    await requireExecutive();
    const users = await listUsersForAdmin();
    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      if (err.message === "FORBIDDEN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    const executive = await requireExecutive();

    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    const user = await registerExecutive({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    await logAdminAction({
      adminUserId: executive.id,
      action: "executive.create",
      targetType: "user",
      targetId: user.id,
      metadata: { email: user.email },
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      if (err.message === "FORBIDDEN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
      if (err.message === "EMAIL_TAKEN") {
        return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
      }
      if (err.message === "EMAIL_DOMAIN_FORBIDDEN") {
        return NextResponse.json({ error: "EMAIL_DOMAIN_FORBIDDEN" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }
}
