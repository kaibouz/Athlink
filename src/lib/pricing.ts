import type { PackageType } from "@/types";

/**
 * Lesson pricing, shared by the booking form (to display) and the server (to
 * charge). The server never trusts a price sent by the browser — it recomputes
 * from the coach's rate with this table.
 */
export const PACKAGE_MULTIPLIER: Record<PackageType, number> = {
  single: 1,
  pack: 5 * 0.9, // 5 sessions, 10% off
  subscription: 4 * 0.85, // 4 sessions / month, 15% off
};

export function isPackageType(value: unknown): value is PackageType {
  return typeof value === "string" && value in PACKAGE_MULTIPLIER;
}

export function priceFor(pricePerHour: number, packageType: PackageType): number {
  return Math.round(pricePerHour * PACKAGE_MULTIPLIER[packageType]);
}
