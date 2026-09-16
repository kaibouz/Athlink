"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Lock, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import {
  getPlanSpec,
  isProPlan,
  planAudienceFromRole,
  type PlanAudience,
  type PlanFeatureKey,
  type PlatformPlanId,
} from "@/lib/platform-plans";
import type { PlatformPlanId as UserPlan } from "@/types";
import { Button } from "@/components/ui/Button";

const ATHLETE_FEATURES: PlanFeatureKey[] = [
  "book_verified_coaches",
  "message_thread",
  "training_feed",
  "session_history",
  "ai_breakdowns",
  "week_comparisons",
  "full_progress_dashboard",
  "scout_visibility",
  "priority_booking",
];

const COACH_FEATURES: PlanFeatureKey[] = [
  "public_coach_profile",
  "calendar_qr_booking",
  "message_thread",
  "my_athletes_basic",
  "session_history",
  "search_priority",
  "earnings_analytics",
  "athlete_ai_suite",
  "scout_discovery_tools",
  "featured_badge",
];

function featureLabelKey(feature: PlanFeatureKey): MessageKey {
  return `plan_feat_${feature}` as MessageKey;
}

function featureHas(audience: PlanAudience, plan: PlatformPlanId, feature: PlanFeatureKey) {
  return getPlanSpec(audience, plan).included.includes(feature);
}

export function usePlatformPlan() {
  const { user, setPlan: authSetPlan } = useAuth();
  const audience = planAudienceFromRole(user?.role);
  const plan: PlatformPlanId = user?.plan === "pro" ? "pro" : "free";
  const [busy, setBusy] = useState(false);

  const setPlan = useCallback(
    async (next: UserPlan) => {
      setBusy(true);
      try {
        return await authSetPlan(next);
      } finally {
        setBusy(false);
      }
    },
    [authSetPlan],
  );

  return { user, audience, plan, isPro: isProPlan(plan), busy, setPlan, spec: getPlanSpec(audience, plan) };
}

/** Compact upgrade CTA used on Progress / Breakdown when Free is capped. */
export function ProUpgradeBanner({
  titleKey = "plan_upgrade_title",
  bodyKey = "plan_upgrade_body",
}: {
  titleKey?: MessageKey;
  bodyKey?: MessageKey;
}) {
  const { t } = useLocale();
  const { isPro, busy, setPlan } = usePlatformPlan();
  if (isPro) return null;

  return (
    <div className="mx-card mx-route-texture">
      <div className="flex items-start gap-2">
        <span className="mx-toast-ic">
          <Lock className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="text-[0.8rem]">{t(titleKey)}</b>
          <span className="mt-0.5 block text-[0.7rem] text-[var(--mx-dimmer)]">{t(bodyKey)}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          className="mx-btn mx-btn-accent border-0 text-[0.75rem]"
          disabled={busy}
          onClick={() => void setPlan("pro")}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("plan_upgrade_cta")}
        </Button>
        <Link href="/pricing" className="text-[0.7rem] font-semibold text-[var(--mx-blue-2)] underline-offset-2 hover:underline">
          {t("plan_compare_link")}
        </Link>
      </div>
    </div>
  );
}

/** Side-by-side Free vs Pro for athlete or coach. */
export function PlanComparison({
  audience,
  showUpgrade = true,
}: {
  audience: PlanAudience;
  showUpgrade?: boolean;
}) {
  const { t } = useLocale();
  const { plan: current, busy, setPlan, user } = usePlatformPlan();
  const features = audience === "coach" ? COACH_FEATURES : ATHLETE_FEATURES;
  const free = getPlanSpec(audience, "free");
  const pro = getPlanSpec(audience, "pro");

  const rows = useMemo(
    () =>
      features.map((f) => ({
        key: f,
        label: t(featureLabelKey(f)),
        free: featureHas(audience, "free", f),
        pro: featureHas(audience, "pro", f),
        freeNote:
          f === "ai_breakdowns" && audience === "athlete"
            ? t("plan_ai_free_cap")
            : null,
      })),
    [audience, features, t],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["free", "pro"] as const).map((id) => {
        const spec = id === "free" ? free : pro;
        const active = current === id && !!user;
        return (
          <article
            key={id}
            className={`rounded-2xl border p-5 ${
              id === "pro"
                ? "border-brand-400/50 bg-brand-50/40 shadow-sm dark:bg-white/5"
                : "border-brand-100 bg-white/60 dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-brand-950 dark:text-white">
                {t(id === "free" ? "plan_free_name" : "plan_pro_name")}
              </h3>
              {id === "pro" ? (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-white uppercase">
                  {t("plan_popular")}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-3xl font-bold text-brand-950 dark:text-white">
              {spec.priceUsdMonthly === 0 ? (
                <>
                  $0<span className="text-sm font-semibold text-brand-500"> {t("plan_free_period")}</span>
                </>
              ) : (
                <>
                  ${spec.priceUsdMonthly}
                  <span className="text-sm font-semibold text-brand-500"> {t("plan_pro_period")}</span>
                </>
              )}
            </p>
            <p className="mt-2 text-sm text-brand-600 dark:text-white/70">
              {t(
                audience === "coach"
                  ? id === "free"
                    ? "plan_coach_free_desc"
                    : "plan_coach_pro_desc"
                  : id === "free"
                    ? "plan_athlete_free_desc"
                    : "plan_athlete_pro_desc",
              )}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {rows.map((row) => {
                const ok = id === "free" ? row.free : row.pro;
                return (
                  <li
                    key={row.key}
                    className={`flex items-start gap-2 ${ok ? "text-brand-800 dark:text-white/90" : "text-brand-400 line-through dark:text-white/35"}`}
                  >
                    {ok ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>
                      {row.label}
                      {ok && id === "free" && row.freeNote ? (
                        <span className="mt-0.5 block text-xs font-medium text-brand-500 no-underline">
                          {row.freeNote}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
            {showUpgrade && user ? (
              <Button
                className="mt-5 w-full"
                variant={id === "pro" ? "primary" : "ghost"}
                disabled={busy || active}
                onClick={() => void setPlan(id)}
              >
                {active
                  ? t("plan_current")
                  : id === "pro"
                    ? t("plan_upgrade_cta")
                    : t("plan_downgrade_cta")}
              </Button>
            ) : (
              <Link
                href={audience === "coach" ? "/join/coach" : "/join/athlete"}
                className="mt-5 block"
              >
                <Button className="w-full" variant={id === "pro" ? "primary" : "ghost"}>
                  {id === "pro" ? t("plan_start_pro") : t("plan_start_free")}
                </Button>
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
