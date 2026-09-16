"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { usePlatformPlan } from "@/components/plans/PlanComparison";
import { canSwitchPlatformPlan, isDemoPlanAccount } from "@/lib/demo-plan";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { PlatformPlanId } from "@/types";

/** Segmented Free | Pro control — demo accounts (kaibouz) can open either surface. */
export function DemoPlanToggle({ className, dense }: { className?: string; dense?: boolean }) {
  const { t } = useLocale();
  const { user, plan, busy, setPlan, isPro } = usePlatformPlan();
  if (!canSwitchPlatformPlan(user)) return null;

  const demo = isDemoPlanAccount(user);
  const options: PlatformPlanId[] = ["free", "pro"];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="group"
        aria-label={t("plan_demo_toggle_label")}
        className={cn(
          "inline-flex rounded-xl border border-white/15 bg-black/20 p-1",
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
                    ? "bg-[color:var(--mx-blue-2)] text-black"
                    : "bg-white/15 text-white"
                  : "text-[var(--mx-dim)] hover:text-white",
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
      {demo ? (
        <p className="text-[0.65rem] text-[var(--mx-dimmer)]">{t("plan_demo_toggle_hint")}</p>
      ) : !isPro ? (
        <p className="text-[0.65rem] text-[var(--mx-dimmer)]">{t("plan_upgrade_demo_note")}</p>
      ) : null}
    </div>
  );
}

/** Platform card: current plan + upgrade / switch + compare. */
export function PlanMembershipSection({ className }: { className?: string }) {
  const { t } = useLocale();
  const { isPro, busy, setPlan, user } = usePlatformPlan();
  if (!user) return null;

  return (
    <div className={cn("mx-card mx-route-texture", className)}>
      <div className="mx-t">{t("plan_me_title")}</div>
      <p className="mt-1 text-sm text-[var(--mx-dim)]">
        {isPro ? t("plan_me_pro_body") : t("plan_me_free_body")}
      </p>
      <div className="mt-3">
        <DemoPlanToggle />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!isPro ? (
          <Button
            className="mx-btn mx-btn-accent border-0 text-[0.75rem]"
            disabled={busy}
            onClick={() => void setPlan("pro")}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("plan_upgrade_cta")}
          </Button>
        ) : (
          <Button
            className="mx-btn mx-btn-ghost text-[0.75rem]"
            disabled={busy}
            onClick={() => void setPlan("free")}
          >
            {t("plan_downgrade_cta")}
          </Button>
        )}
        <Link
          href="/pricing"
          className="inline-flex items-center text-[0.75rem] font-semibold text-[var(--mx-blue-2)] underline-offset-2 hover:underline"
        >
          {t("plan_compare_link")}
        </Link>
      </div>
    </div>
  );
}
