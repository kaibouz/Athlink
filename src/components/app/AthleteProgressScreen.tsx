"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/lib/client/use-api";
import { formatDateJa } from "@/lib/utils";
import { ProUpgradeBanner, usePlatformPlan } from "@/components/plans/PlanComparison";
import type { AthleteProgress, ProgressMetric } from "@/types";

const LOWER_BETTER = new Set(["pop_time", "sixty_time", "swing_length", "first_step", "transfer"]);

/** Build a normalized sparkline polyline from a metric series. */
function sparkPoints(series: { value: number }[], w = 280, h = 60): string {
  if (series.length === 0) return "";
  const vals = series.map((s) => s.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const step = series.length > 1 ? w / (series.length - 1) : w;
  return series
    .map((s, i) => {
      const x = Math.round(i * step);
      const y = Math.round(h - ((s.value - min) / span) * (h - 8) - 4);
      return `${x},${y}`;
    })
    .join(" ");
}

function trendSince(metric: ProgressMetric): string {
  if (metric.series.length < 2) return "";
  const first = metric.series[0];
  const diff = Number((metric.latest - first.value).toFixed(1));
  const improved = LOWER_BETTER.has(metric.metric) ? diff < 0 : diff > 0;
  const arrow = diff > 0 ? "▲" : "▼";
  return `${arrow} ${Math.abs(diff)}${metric.unit} · ${improved ? "improving" : "watch"}`;
}

/** Progress tab — Free: headline + report cards; Pro: goals + week framing. */
export function AthleteProgressScreen() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const { isPro } = usePlatformPlan();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const { data, loading } = useApi<{ progress: AthleteProgress | null }>(
    user ? "/api/me/progress" : null,
  );
  const progress = data?.progress ?? null;

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("nav_progress")}</h1>
        <p className="mt-2 text-[var(--mx-dim)]">{t("bookings_login_hint")}</p>
        <Link href="/sign-in?redirect_url=/progress" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  const headline = progress?.headline?.[0] ?? null;
  const goals = progress?.goals ?? [];
  const reportCards = progress?.reportCards ?? [];

  return (
    <div className="mx-app mx-route-texture mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="mx-hdr">
        <div>
          <h1>{t("nav_progress")}</h1>
          <small>{t("plan_progress_sub")}</small>
        </div>
        {isPro ? (
          <span className="mx-pill mx-pill-accent inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> {t("plan_pro_name")}
          </span>
        ) : (
          <span className="mx-pill inline-flex items-center gap-1">{t("plan_free_name")}</span>
        )}
      </header>

      {headline ? (
        <div className="mx-card mb-3">
          <div className="mx-t">{headline.label}</div>
          <div className="mx-big">
            {headline.latest}
            {headline.unit ? <span className="text-sm"> {headline.unit}</span> : null}{" "}
            {isPro ? (
              <span className="text-sm font-semibold text-[var(--mx-green)]">{trendSince(headline)}</span>
            ) : null}
          </div>
          {isPro ? (
            <svg viewBox="0 0 280 64" className="mt-3 h-16 w-full" aria-hidden>
              <polyline
                fill="none"
                stroke="var(--mx-blue-2)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparkPoints(headline.series)}
              />
            </svg>
          ) : null}
        </div>
      ) : (
        <div className="mx-card mb-3">
          <div className="mx-t">{t("plan_progress_headline")}</div>
          <p className="text-sm text-[var(--mx-dim)]">
            {loading ? t("plan_loading") : t("plan_progress_no_metrics")}
          </p>
        </div>
      )}

      {isPro ? (
        <div className="mx-card mb-3">
          <div className="mx-t">{t("plan_progress_goals")}</div>
          {goals.map((g, i) => (
            <div key={g.id}>
              <div className="mx-rank">
                <span className="n">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  {g.label} → {g.target}
                  {g.unit}
                </span>
                <span className="v">
                  {g.current}
                  {g.unit}
                </span>
              </div>
              <div className="mx-bar mb-2 mt-1">
                <i style={{ width: `${Math.round(Math.min(100, g.pct * 100))}%` }} />
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-sm text-[var(--mx-dim)]">
              {loading ? t("plan_loading") : t("plan_progress_no_goals")}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <ProUpgradeBanner titleKey="plan_progress_gate_title" bodyKey="plan_progress_gate_body" />
        </div>
      )}

      <div className="mx-card mb-3">
        <div className="mx-t">{t("plan_progress_reports")}</div>
        {reportCards.length > 0 ? (
          reportCards.map((r) => (
            <Link key={r.id} href="/messages" className="mx-li mb-2">
              <div className="mx-w">
                <b>
                  {formatDateJa(r.createdAt.slice(0, 10), dateLocale)} · {r.coachName}
                </b>
                <span>{r.subject}</span>
              </div>
              {r.aiAttached ? <span className="mx-pill mx-pill-accent">AI</span> : null}
              <span className="text-[var(--mx-dimmer)]">›</span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-[var(--mx-dim)]">{t("plan_progress_no_reports")}</p>
        )}
      </div>

      {!isPro ? <ProUpgradeBanner /> : null}
    </div>
  );
}
