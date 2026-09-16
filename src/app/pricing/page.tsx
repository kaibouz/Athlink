"use client";

import { useState } from "react";
import Link from "next/link";
import { PlanComparison, usePlatformPlan } from "@/components/plans/PlanComparison";
import { PageContainer, PageHeader } from "@/components/layout/PageShell";
import { useLocale } from "@/lib/i18n/provider";
import { Badge } from "@/components/ui/Badge";
import type { PlanAudience } from "@/lib/platform-plans";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { t } = useLocale();
  const { audience: roleAudience, plan, user, isPro } = usePlatformPlan();
  const [audience, setAudience] = useState<PlanAudience>(roleAudience);

  return (
    <PageContainer>
      <PageHeader title={t("plan_page_title")} description={t("plan_page_sub")} />

      {user ? (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-brand-600">
          <span>{t("plan_your_plan")}</span>
          <Badge className={isPro ? "bg-brand-600 text-white" : ""}>
            {isPro ? t("plan_pro_name") : t("plan_free_name")}
          </Badge>
          <span className="text-brand-400">·</span>
          <span>{roleAudience === "coach" ? t("role_coach") : t("role_athlete")}</span>
          <span className="text-brand-400">·</span>
          <Link
            href="/me#account-status"
            className="font-semibold text-brand-800 underline-offset-2 hover:underline"
          >
            {t("plan_account_status_title")}
          </Link>
        </div>
      ) : (
        <p className="mb-6 text-sm text-brand-600">
          {t("plan_guest_hint")}{" "}
          <Link href="/sign-in?redirect_url=/pricing" className="font-semibold underline">
            {t("nav_login")}
          </Link>
        </p>
      )}

      <div className="mb-4 flex gap-2 text-sm font-semibold" role="tablist" aria-label={t("plan_page_title")}>
        {(["athlete", "coach"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={audience === id}
            onClick={() => setAudience(id)}
            className={cn(
              "rounded-full px-3 py-1 transition",
              audience === id ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100",
            )}
          >
            {id === "athlete" ? t("role_athlete") : t("role_coach")}
          </button>
        ))}
      </div>

      <PlanComparison audience={audience} showUpgrade={!!user} />

      <p className="mt-8 text-center text-xs text-brand-500">
        {t("plan_zero_fees")} · {plan === "pro" ? t("plan_cancel_anytime") : t("plan_auto_switch_note")}
      </p>
    </PageContainer>
  );
}
