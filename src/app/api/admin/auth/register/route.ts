import { NextResponse } from "next/server";
import { isBootstrapSecretValid } from "@/lib/admin-auth";
import {
  getCurrentUser,
  registerExecutive,
  requireExecutive,
} from "@/lib/auth-server";
import { countExecutives } from "@/lib/server/data";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ allowed: false, reason: "no_database" });
  }

  const executiveCount = await countExecutives();
  const hasBootstrap = Boolean(process.env.ADMIN_BOOTSTRAP_SECRET?.trim());

  if (executiveCount === 0 && hasBootstrap) {
    return NextResponse.json({ allowed: true, reason: "bootstrap" });
  }

  const user = await getCurrentUser();
  if (user?.role === "executive") {
    return NextResponse.json({ allowed: true, reason: "executive" });
  }

  return NextResponse.json({ allowed: false, reason: "closed" });
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
    }

    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
      bootstrapSecret?: string;
    };

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    const executiveCount = await countExecutives();
    const bootstrapOk = isBootstrapSecretValid(body.bootstrapSecret);

    if (executiveCount === 0) {
      if (!bootstrapOk) {
        return NextResponse.json({ error: "BOOTSTRAP_REQUIRED" }, { status: 403 });
      }
    } else {
      let authorized = bootstrapOk;
      if (!authorized) {
        try {
          await requireExecutive();
          authorized = true;
        } catch {
          authorized = false;
        }
      }
      if (!authorized) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }

    const user = await registerExecutive({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMAIL_TAKEN") {
        return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
      }
      if (err.message === "EMAIL_DOMAIN_FORBIDDEN") {
        return NextResponse.json({ error: "EMAIL_DOMAIN_FORBIDDEN" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 500 });
  }
}
