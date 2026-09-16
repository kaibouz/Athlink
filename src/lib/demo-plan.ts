import type { User } from "@/types";

/** Demo accounts that may manually preview Free vs Pro on My Page only. */
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
