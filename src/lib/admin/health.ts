import { sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";

export type HealthStatus = "up" | "down" | "degraded" | "unconfigured";

export type HealthCheck = {
  id: string;
  label: string;
  status: HealthStatus;
  latencyMs?: number;
  detail?: string;
  checkedAt: string;
};

async function timedCheck(fn: () => Promise<void>): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await fn();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "check failed",
    };
  }
}

export async function runHealthChecks(): Promise<HealthCheck[]> {
  const checkedAt = new Date().toISOString();
  const checks: HealthCheck[] = [];

  const dbCheck = await timedCheck(async () => {
    if (!isDatabaseConfigured()) throw new Error("DATABASE_URL not set");
    await getDb().execute(sql`SELECT 1`);
  });
  checks.push({
    id: "postgres",
    label: "PostgreSQL",
    status: dbCheck.ok ? "up" : isDatabaseConfigured() ? "down" : "unconfigured",
    latencyMs: dbCheck.latencyMs,
    detail: dbCheck.error,
    checkedAt,
  });

  const authCheck = await timedCheck(async () => {
    if (!isDatabaseConfigured()) throw new Error("no database");
    await getDb().execute(sql`SELECT 1 FROM sessions LIMIT 1`);
  });
  checks.push({
    id: "auth",
    label: "Session auth",
    status: authCheck.ok ? "up" : "degraded",
    latencyMs: authCheck.latencyMs,
    detail: authCheck.error,
    checkedAt,
  });

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  checks.push({
    id: "stripe",
    label: "Stripe API",
    status: stripeKey ? "unconfigured" : "unconfigured",
    detail: stripeKey ? "Key present — webhook ping not wired in MVP" : "STRIPE_SECRET_KEY not set",
    checkedAt,
  });

  const resendKey = process.env.RESEND_API_KEY?.trim();
  checks.push({
    id: "resend",
    label: "Resend",
    status: resendKey ? "unconfigured" : "unconfigured",
    detail: resendKey ? "Key present — delivery log not wired in MVP" : "RESEND_API_KEY not set",
    checkedAt,
  });

  const sentryDsn = process.env.SENTRY_DSN?.trim();
  checks.push({
    id: "sentry",
    label: "Sentry",
    status: sentryDsn ? "unconfigured" : "unconfigured",
    detail: sentryDsn ? "DSN present — issue proxy not wired in MVP" : "SENTRY_DSN not set",
    checkedAt,
  });

  checks.push({
    id: "vercel",
    label: "Vercel deploy",
    status: process.env.VERCEL ? "up" : "unconfigured",
    detail: process.env.VERCEL_URL ?? "Local dev",
    checkedAt,
  });

  return checks;
}

let cachedHealth: { at: number; checks: HealthCheck[] } | null = null;

export async function getCachedHealthChecks(): Promise<HealthCheck[]> {
  const now = Date.now();
  if (cachedHealth && now - cachedHealth.at < 60_000) {
    return cachedHealth.checks;
  }
  const checks = await runHealthChecks();
  cachedHealth = { at: now, checks };
  return checks;
}
