"use client";

import { useState } from "react";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";

const LABELS: Record<string, string> = {
  signup: "Sign-ups",
  coach_profile_view: "Coach profile views",
  search: "Searches",
  book_click: "“Request lesson” clicks",
  booking_request: "Booking requests",
  lesson_completed: "Completed lessons",
};

/** The MVP funnel — what users did, not just what was built. */
export function FunnelCard() {
  const [days, setDays] = useState(30);
  const [steps, setSteps] = useState<{ key: string; count: number }[] | null>(null);

  useDeferredEffect(() => {
    void fetch(`/api/admin/funnel?days=${days}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { steps: { key: string; count: number }[] } | null) => setSteps(d?.steps ?? []));
  }, [days]);

  const max = Math.max(1, ...(steps ?? []).map((s) => s.count));
  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-[color:var(--mx-panel)] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-bold text-brand-950">Funnel</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-md border border-white/10 bg-transparent px-2 py-1 text-sm text-brand-800"
        >
          {[7, 30, 90].map((d) => (
            <option key={d} value={d}>
              Last {d} days
            </option>
          ))}
        </select>
      </div>
      {steps === null ? (
        <p className="text-sm text-brand-500">Loading…</p>
      ) : (
        <ol className="space-y-2">
          {steps.map((s, i) => {
            const prev = i > 0 ? steps[i - 1].count : null;
            const rate = prev ? Math.round((s.count / prev) * 100) : null;
            return (
              <li key={s.key} className="grid grid-cols-[180px_1fr_110px] items-center gap-3 text-sm">
                <span className="text-brand-700">{LABELS[s.key] ?? s.key}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-white/5">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[var(--mx-blue-1)] to-[var(--mx-blue-2)]"
                    style={{ width: `${(s.count / max) * 100}%` }}
                  />
                </span>
                <span className="text-right tabular-nums text-brand-900">
                  {s.count}
                  {rate !== null ? <span className="ml-1 text-xs text-brand-500">({rate}%)</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
