"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayKey } from "@/lib/dates";
import type { TimeSlot } from "@/types";

const ymd = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * Month calendar for picking a lesson day — the app's booking calendar:
 * each day shows whether it's open, nearly full, or fully booked.
 */
export function BookingMonth({
  slots,
  value,
  onChange,
  locale,
  labels,
}: {
  slots: TimeSlot[];
  value: string;
  onChange: (date: string) => void;
  locale: string;
  labels: { open: string; few: string; full: string };
}) {
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const byDay = useMemo(() => {
    const m = new Map<string, { open: number; total: number }>();
    for (const s of slots) {
      const e = m.get(s.date) ?? { open: 0, total: 0 };
      e.total++;
      if (s.available) e.open++;
      m.set(s.date, e);
    }
    return m;
  }, [slots]);

  const months = useMemo(() => [...new Set([...byDay.keys()].map((d) => d.slice(0, 7)))].sort(), [byDay]);
  const [picked, setPicked] = useState<string | null>(null);
  const month = picked && months.includes(picked) ? picked : (value || months[0] || todayKey()).slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = Sun
  const lead = (first + 6) % 7; // Monday-first, like the app
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const idx = months.indexOf(month);
  const today = todayKey();

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(dateLocale, { weekday: "narrow", timeZone: "UTC" }),
  );

  return (
    <div className="rounded-2xl border border-[color:var(--mx-border)] bg-[color:var(--mx-panel-2)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <b className="text-sm text-[color:var(--mx-text)]">
          {new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(dateLocale, { month: "long", year: "numeric", timeZone: "UTC" })}
        </b>
        <span className="flex gap-1">
          <button type="button" disabled={idx <= 0} onClick={() => setPicked(months[idx - 1])} className="rounded-md border border-[color:var(--mx-border)] p-1 disabled:opacity-30" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" disabled={idx < 0 || idx >= months.length - 1} onClick={() => setPicked(months[idx + 1])} className="rounded-md border border-[color:var(--mx-border)] p-1 disabled:opacity-30" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold text-[color:var(--mx-dimmer)]">
        {weekdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, i) => <span key={`p${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const key = ymd(y, m - 1, i + 1);
          const info = byDay.get(key);
          const bookable = Boolean(info && info.open > 0);
          const state = !info ? "none" : info.open === 0 ? "full" : info.open <= 2 ? "few" : "open";
          const on = key === value;
          return (
            <button
              key={key}
              type="button"
              disabled={!bookable}
              onClick={() => onChange(key)}
              aria-pressed={on}
              className={cn(
                "relative flex h-9 flex-col items-center justify-center rounded-lg text-[0.8rem] tabular-nums transition",
                on
                  ? "bg-[color:var(--mx-blue-2)] font-bold text-[#05070c]"
                  : bookable
                    ? "border border-[color:var(--mx-border-strong)] text-[color:var(--mx-text)] hover:border-[color:var(--mx-blue-2)]"
                    : "text-[color:var(--mx-dimmer)] opacity-50",
                key === today && !on && "ring-1 ring-white/50",
              )}
            >
              {i + 1}
              {state !== "none" && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    on ? "bg-[#05070c]" : state === "open" ? "bg-[color:var(--mx-blue-2)]" : state === "few" ? "bg-[color:var(--mx-amber)]" : "border border-[color:var(--mx-dimmer)]",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-[color:var(--mx-dim)]">
        <span className="flex items-center gap-1"><i className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--mx-blue-2)]" />{labels.open}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--mx-amber)]" />{labels.few}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-1.5 w-1.5 rounded-full border border-[color:var(--mx-dimmer)]" />{labels.full}</span>
      </div>
    </div>
  );
}
