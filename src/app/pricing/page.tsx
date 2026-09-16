"use client";

import Link from "next/link";
import { PlanComparison, usePlatformPlan } from "@/components/plans/PlanComparison";
import { PageContainer, PageHeader } from "@/components/layout/PageShell";
import { useLocale } from "@/lib/i18n/provider";
import { Badge } from "@/components/ui/Badge";

export default function PricingPage() {
  const { t } = useLocale();
  const { audience, plan, user, isPro } = usePlatformPlan();

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
          <span>
            {audience === "coach" ? t("role_coach") : t("role_athlete")}
          </span>
        </div>
      ) : (
        <p className="mb-6 text-sm text-brand-600">
          {t("plan_guest_hint")}{" "}
          <Link href="/sign-in?redirect_url=/pricing" className="font-semibold underline">
            {t("nav_login")}
          </Link>
        </p>
      )}

      <div className="mb-4 flex gap-2 text-sm font-semibold">
        <span
          className={`rounded-full px-3 py-1 ${audience === "athlete" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`}
        >
          {t("role_athlete")}
        </span>
        <span
          className={`rounded-full px-3 py-1 ${audience === "coach" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`}
        >
          {t("role_coach")}
        </span>
      </div>

      <PlanComparison audience={audience} showUpgrade={!!user} />

      <p className="mt-8 text-center text-xs text-brand-500">
        {t("plan_zero_fees")} · {plan === "pro" ? t("plan_cancel_anytime") : t("plan_upgrade_demo_note")}
      </p>
    </PageContainer>
  );
}
