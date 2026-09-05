"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/lib/client/use-api";
import { formatDateJa } from "@/lib/utils";
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

/** Progress tab — live headline metric + sparkline, ranked goals, report cards, Pro framing */
export function AthleteProgressScreen() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const { data, loading } = useApi<{ progress: AthleteProgress | null }>(
    user ? "/api/me/progress" : null,
  );
  const progress = data?.progress ?? null;

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Progress</h1>
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
          <h1>Progress</h1>
          <small>Live from your last sessions</small>
        </div>
        <span className="mx-pill mx-pill-accent inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Pro
        </span>
      </header>

      {headline ? (
        <div className="mx-card mb-3">
          <div className="mx-t">{headline.label}</div>
          <div className="mx-big">
            {headline.latest}
            {headline.unit ? <span className="text-sm"> {headline.unit}</span> : null}{" "}
            <span className="text-sm font-semibold text-[var(--mx-green)]">{trendSince(headline)}</span>
          </div>
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
        </div>
      ) : (
        <div className="mx-card mb-3">
          <div className="mx-t">Headline metric</div>
          <p className="text-sm text-[var(--mx-dim)]">{loading ? "Loading…" : "No metrics yet."}</p>
        </div>
      )}

      <div className="mx-card mb-3">
        <div className="mx-t">Goals · ranked for your position</div>
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
          <p className="text-sm text-[var(--mx-dim)]">{loading ? "Loading…" : "No goals set yet."}</p>
        )}
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">Report cards</div>
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
          <p className="text-sm text-[var(--mx-dim)]">No report cards yet.</p>
        )}
      </div>

      <div className="mx-card mx-route-texture">
        <div className="flex items-center gap-2">
          <span className="mx-toast-ic">
            <Lock className="h-3.5 w-3.5" />
          </span>
          <div>
            <b className="text-[0.8rem]">AthLink Pro — deeper analytics</b>
            <span className="block text-[0.7rem] text-[var(--mx-dimmer)]">
              Percentile ranks, opponent-adjusted trends & video-linked metrics.
            </span>
          </div>
        </div>
        <Button className="mx-btn mx-btn-accent mt-3 border-0 text-[0.75rem]">Unlock Pro</Button>
      </div>
    </div>
  );
}
