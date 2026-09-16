"use client";

import { Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { usePlatformPlan } from "@/components/plans/PlanComparison";
import { isDemoPlanAccount } from "@/lib/demo-plan";
import { cn } from "@/lib/utils";
import type { PlatformPlanId } from "@/types";

/**
 * Demo-only Free | Pro preview control.
 * Production membership flips automatically after subscribe — no manual switch.
 * Only render on My Page account-status for demo accounts (e.g. kaibouz).
 */
export function DemoPlanToggle({ className, dense }: { className?: string; dense?: boolean }) {
  const { t } = useLocale();
  const { user, plan, busy, setPlan } = usePlatformPlan();
  if (!isDemoPlanAccount(user)) return null;

  const options: PlatformPlanId[] = ["free", "pro"];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="group"
        aria-label={t("plan_demo_toggle_label")}
        className={cn(
          "inline-flex rounded-xl border border-brand-200 bg-brand-50/80 p-1 dark:border-white/15 dark:bg-black/20",
          dense && "rounded-lg p-0.5",
        )}
      >
        {options.map((id) => {
          const active = plan === id;
          return (
            <button
              key={id}
              type="button"
              disabled={busy || active}
              aria-pressed={active}
              onClick={() => void setPlan(id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                dense && "px-2.5 py-1 text-[0.7rem]",
                active
                  ? id === "pro"
                    ? "bg-brand-600 text-white dark:bg-[color:var(--mx-blue-2)] dark:text-black"
                    : "bg-white text-brand-900 shadow-sm dark:bg-white/15 dark:text-white"
                  : "text-brand-500 hover:text-brand-800 dark:text-[var(--mx-dim)] dark:hover:text-white",
              )}
            >
              {id === "pro" ? (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className={dense ? "h-3 w-3" : "h-3.5 w-3.5"} />
                  {t("plan_pro_name")}
                </span>
              ) : (
                t("plan_free_name")
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[0.65rem] text-brand-500 dark:text-[var(--mx-dimmer)]">
        {t("plan_demo_toggle_hint")}
      </p>
    </div>
  );
}
