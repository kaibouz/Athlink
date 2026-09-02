import { NextResponse } from "next/server";
import { listFeatureFlags } from "@/lib/admin/data";

/** Public read-only feature flags for the web app */
export async function GET() {
  const rows = await listFeatureFlags();
  const flags = Object.fromEntries(rows.map((r) => [r.key, r.enabled]));
  return NextResponse.json({ flags });
}
