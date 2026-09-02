"use client";

import Link from "next/link";
import { BarChart3, Eye, MousePointerClick, Share2 } from "lucide-react";
import { CoachGate } from "@/components/coach/CoachGate";
import { useMyCoach } from "@/lib/use-my-coach";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { PageContainer, PageHeader } from "@/components/layout/PageShell";
import { useEffect, useState } from "react";

type CoachAnalytics = {
  profileViews: number;
  bookingClicks: number;
  bookings: number;
};

function FunnelBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-brand-800">{label}</span>
        <span className="tabular-nums text-brand-600">
          {value}
          {max > 0 && value > 0 ? ` (${pct}%)` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${max > 0 ? Math.max(4, pct) : 0}%` }}
        />
      </div>
    </div>
  );
}

function AnalyticsInner() {
  const { t } = useLocale();
  const { coach, loading, hasProfile } = useMyCoach();
  const [analytics, setAnalytics] = useState<CoachAnalytics | null>(null);

  useEffect(() => {
    if (!hasProfile) return;
    void fetch("/api/coaches/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { analytics: CoachAnalytics | null }) => {
        setAnalytics(data.analytics);
      })
      .catch(() => setAnalytics(null));
  }, [hasProfile]);

  if (loading) {
    return (
      <PageContainer className="py-16 text-center text-brand-500">{t("loading")}</PageContainer>
    );
  }

  if (!hasProfile || !coach) {
    return (
      <PageContainer className="py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("register_prompt_title")}</h1>
        <p className="mt-2 text-brand-600">{t("register_prompt_body")}</p>
        <Link href="/coach/register" className="mt-6 inline-block">
          <Button size="lg">{t("register_submit")}</Button>
        </Link>
      </PageContainer>
    );
  }

  const stats = analytics ?? { profileViews: 0, bookingClicks: 0, bookings: 0 };
  const funnelMax = Math.max(stats.profileViews, 1);

  return (
    <PageContainer>
      <PageHeader title={t("analytics_title")} description={t("analytics_sub")} />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 text-brand-600">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-semibold">{t("analytics_profile_views")}</span>
          </div>
          <p className="mt-2 text-3xl font-black tabular-nums text-brand-950">
            {stats.profileViews}
          </p>
        </article>
        <article className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 text-brand-600">
            <MousePointerClick className="h-4 w-4" />
            <span className="text-sm font-semibold">{t("analytics_booking_clicks")}</span>
          </div>
          <p className="mt-2 text-3xl font-black tabular-nums text-brand-950">
            {stats.bookingClicks}
          </p>
        </article>
        <article className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 text-brand-600">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-semibold">{t("analytics_bookings")}</span>
          </div>
          <p className="mt-2 text-3xl font-black tabular-nums text-brand-950">
            {stats.bookings}
          </p>
        </article>
      </div>

      <section className="mt-8 rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-bold text-brand-950">{t("analytics_funnel")}</h2>
        <div className="mt-5 space-y-4">
          <FunnelBar
            label={t("analytics_funnel_views")}
            value={stats.profileViews}
            max={funnelMax}
          />
          <FunnelBar
            label={t("analytics_funnel_clicks")}
            value={stats.bookingClicks}
            max={funnelMax}
          />
          <FunnelBar
            label={t("analytics_funnel_booked")}
            value={stats.bookings}
            max={funnelMax}
          />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-surface p-6">
        <div className="flex items-start gap-3">
          <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <h2 className="text-lg font-bold text-brand-950">{t("analytics_share_title")}</h2>
            <p className="mt-1 text-sm text-brand-600">{t("analytics_share_body")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/coach/qr">
                <Button variant="outline">{t("analytics_open_qr")}</Button>
              </Link>
              <Link href={`/coaches/${coach.id}`}>
                <Button>{t("analytics_view_public")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export default function CoachAnalyticsPage() {
  return (
    <CoachGate>
      <AnalyticsInner />
    </CoachGate>
  );
}
