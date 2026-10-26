/**
 * Profile details for the seeded demo coaches (lib/data.ts), which predate
 * positions / levels / venues / weekly availability. Only ever applied to
 * those fixture ids — a real coach's profile is never filled in for them.
 */
import { coaches } from "@/lib/data";

const POSITION_FROM_SPECIALTY: Record<string, string[]> = {
  hitting: ["hitting"],
  pitching: ["pitcher"],
  catcher: ["catcher"],
  defense: ["infield", "outfield"],
};

export const DEMO_COACH_IDS = new Set(coaches.map((c) => c.id));

export function demoCoachExtras(c: (typeof coaches)[number]) {
  const positions = [...new Set(c.specialties.flatMap((s) => POSITION_FROM_SPECIALTY[s] ?? []))];
  return {
    positions: positions.length ? positions : ["hitting"],
    levels: ["12u", "14u", "high_school"],
    venues: [`${c.city} — community park field`, `${c.city} — indoor batting cage`],
  };
}
