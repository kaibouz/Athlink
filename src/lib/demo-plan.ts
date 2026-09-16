import type { User } from "@/types";

/** Demo accounts that may freely preview Free and Pro platform surfaces. */
export function isDemoPlanAccount(user: Pick<User, "id" | "name" | "email"> | null | undefined): boolean {
  if (!user) return false;
  const hay = `${user.id} ${user.name} ${user.email}`.toLowerCase();
  return (
    hay.includes("kaibouz") ||
    hay.includes("demo@") ||
    hay.includes("ethan.park") ||
    hay.includes("u-athlete")
  );
}

/** Signed-in members can demo-upgrade without a card in MVP. */
export function canSwitchPlatformPlan(user: Pick<User, "id" | "name" | "email"> | null | undefined): boolean {
  return !!user;
}
