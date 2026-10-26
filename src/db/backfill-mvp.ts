/**
 * One-off, idempotent: bring the seeded demo coaches up to the MVP booking
 * model (weekly availability template + positions / levels / venues).
 *
 *   DATABASE_URL=... npx tsx src/db/backfill-mvp.ts
 *
 * Coaches who registered themselves are left untouched.
 */
import { eq, inArray } from "drizzle-orm";
import { getDb } from "./index";
import { coachAvailability, coachProfiles } from "./schema";
import { coaches } from "@/lib/data";
import { DEMO_COACH_IDS, demoCoachExtras } from "./demo-coach-extras";
import { DEMO_AVAILABILITY, setAvailabilityTemplate } from "@/lib/server/data";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const db = getDb();
  const rows = await db
    .select({ id: coachProfiles.id, positions: coachProfiles.positions, venues: coachProfiles.venues })
    .from(coachProfiles)
    .where(inArray(coachProfiles.id, [...DEMO_COACH_IDS]));
  let profiles = 0;
  let templates = 0;
  for (const row of rows) {
    const fixture = coaches.find((c) => c.id === row.id)!;
    if (!row.positions?.length || !row.venues?.length) {
      await db.update(coachProfiles).set(demoCoachExtras(fixture)).where(eq(coachProfiles.id, row.id));
      profiles++;
    }
    const [has] = await db.select({ id: coachAvailability.id }).from(coachAvailability).where(eq(coachAvailability.coachId, row.id)).limit(1);
    if (!has) {
      await setAvailabilityTemplate(row.id, DEMO_AVAILABILITY);
      templates++;
    }
  }
  console.log(`demo coaches: ${rows.length}, profiles filled: ${profiles}, availability set: ${templates}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
