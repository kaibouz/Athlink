import { and, eq, gte, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb, isDatabaseConfigured } from "@/db";
import { aiBreakdowns } from "@/db/schema";
import {
  PLAN_COOKIE,
  planAudienceFromRole,
  resolvePlanId,
  type PlatformPlanId,
} from "@/lib/platform-plans";
import type { User } from "@/types";

/**
 * Resolve the member's platform plan.
 * MVP: cookie override (demo upgrade) → env default → free.
 * Stripe-backed subscriptions can replace the cookie later without changing call sites.
 */
export async function resolveUserPlan(user: Pick<User, "id" | "role" | "plan">): Promise<PlatformPlanId> {
  if (user.plan) return resolvePlanId(user.plan);

  try {
    const jar = await cookies();
    const fromCookie = jar.get(PLAN_COOKIE)?.value;
    if (fromCookie) return resolvePlanId(fromCookie);
  } catch {
    /* cookies() unavailable outside a request */
  }

  const envDefault = process.env.ATHLINK_DEFAULT_PLAN;
  return resolvePlanId(envDefault);
}

export async function setPlanCookie(plan: PlatformPlanId): Promise<void> {
  const jar = await cookies();
  jar.set(PLAN_COOKIE, plan, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function withResolvedPlan<T extends User>(user: T): Promise<T & { plan: PlatformPlanId }> {
  const plan = await resolveUserPlan(user);
  return { ...user, plan };
}

/** Count AI breakdown jobs created by this athlete in the current UTC month. */
export async function countAiBreakdownsThisMonth(athleteUserId: string): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  const db = getDb();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiBreakdowns)
    .where(and(eq(aiBreakdowns.athleteId, athleteUserId), gte(aiBreakdowns.createdAt, monthStart)));
  return row?.count ?? 0;
}

export function audienceForUser(user: Pick<User, "role">) {
  return planAudienceFromRole(user.role);
}
