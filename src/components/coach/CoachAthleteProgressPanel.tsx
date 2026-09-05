"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useApi } from "@/lib/client/use-api";
import type { AthleteProgress } from "@/types";

const LOWER_BETTER = new Set(["pop_time", "sixty_time", "swing_length", "first_step", "transfer"]);

function sparkPoints(series: { value: number }[], w = 280, h = 56): string {
  if (series.length === 0) return "";
  const vals = series.map((s) => s.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const step = series.length > 1 ? w / (series.length - 1) : w;
  return series
    .map((s, i) => `${Math.round(i * step)},${Math.round(h - ((s.value - min) / span) * (h - 8) - 4)}`)
    .join(" ");
}

/** Mirrors the athlete Progress tab (same goals/metrics/report cards) for the coach. */
export function CoachAthleteProgressPanel({ studentId }: { studentId: string }) {
  const { data, loading } = useApi<{ progress: AthleteProgress | null }>(
    `/api/coach/students/${studentId}/progress`,
  );
  const progress = data?.progress ?? null;
  const headline = progress?.headline?.[0] ?? null;
  const goals = progress?.goals ?? [];
  const reportCards = progress?.reportCards ?? [];
  const breakdown = progress?.latestBreakdown ?? null;

  if (!progress && !loading) {
    return (
      <section className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
        <h2 className="font-bold text-brand-950">Athlete progress</h2>
        <p className="mt-2 text-sm text-brand-500">No linked athlete progress for this student.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-brand-950">Athlete progress</h2>
        {breakdown && (
          <Link
            href={`/breakdown/${breakdown.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
          >
            <Sparkles className="h-3.5 w-3.5" /> Latest breakdown
          </Link>
        )}
      </div>
      <p className="mt-0.5 text-sm text-brand-500">Same live data the athlete sees on their Progress tab.</p>

      {headline && (
        <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
          <div className="text-xs font-medium text-brand-500">{headline.label}</div>
          <div className="text-2xl font-black text-brand-950">
            {headline.latest}
            {headline.unit ? <span className="text-sm"> {headline.unit}</span> : null}
          </div>
          <svg viewBox="0 0 280 56" className="mt-2 h-12 w-full" aria-hidden>
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkPoints(headline.series)}
            />
          </svg>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-sm font-bold text-brand-950">Goals · ranked for position</h3>
        <div className="mt-2 space-y-2.5">
          {goals.map((g, i) => (
            <div key={g.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-700">
                  {i + 1}. {g.label} → {g.target}
                  {g.unit}
                </span>
                <span className="font-bold text-brand-950">
                  {g.current}
                  {g.unit}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                  style={{
                    width: `${Math.round(Math.min(100, g.pct * 100))}%`,
                    filter: LOWER_BETTER.has(g.metric) ? "none" : undefined,
                  }}
                />
              </div>
            </div>
          ))}
          {goals.length === 0 && <p className="text-sm text-brand-500">No goals set.</p>}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-bold text-brand-950">Report cards</h3>
        <ul className="mt-2 space-y-2">
          {reportCards.map((r) => (
            <li key={r.id} className="rounded-xl border border-brand-50 bg-brand-50/50 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-brand-950">{r.subject}</p>
                <span className="text-xs text-brand-500">{r.createdAt.slice(0, 10)}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-brand-600">{r.body}</p>
            </li>
          ))}
          {reportCards.length === 0 && <p className="text-sm text-brand-500">No report cards yet.</p>}
        </ul>
      </div>
    </section>
  );
}
