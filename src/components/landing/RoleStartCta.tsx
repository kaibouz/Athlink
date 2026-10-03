"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROLE_ACCENT_KEY } from "@/components/layout/RoleTheme";
import { signUpHref } from "@/lib/market-to-platform";
import { joinPathFor } from "@/lib/onboarding";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const ROLES = ["athlete", "coach"] as const;

/** Recolor the app to the chosen side straight away, before the account exists. */
function persistAccent(role: (typeof ROLES)[number]) {
  try {
    localStorage.setItem(ROLE_ACCENT_KEY, role);
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.role = role;
}

/**
 * The single entry into the product: pick a side, and the next screen is Clerk
 * sign-up, which returns into that role's profile wizard. No marketing detour
 * between the choice and the account.
 */
export function RoleStartCta({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <div className={cn("flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center", className)}>
      {ROLES.map((role) => (
        <Link
          key={role}
          href={signUpHref(joinPathFor(role))}
          onClick={() => persistAccent(role)}
          className="group"
        >
          <Button
            size="lg"
            variant="ghost"
            className={cn(
              "h-12 w-full min-w-56 rounded-xl px-7 sm:h-14",
              role === "athlete" ? "btn-athlete-primary border-0 font-bold" : "btn-premium",
            )}
          >
            {t(role === "athlete" ? "hq_start_athlete" : "hq_start_coach")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      ))}
    </div>
  );
}
