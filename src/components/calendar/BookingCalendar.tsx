"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { todayKey } from "@/lib/dates";
import type { Booking } from "@/types";

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Month grid for the bookings screen.
 *
 * Always rendered — including for a member with no bookings yet — so the
 * calendar is there to look at whenever the Calendar tab is opened, rather
 * than appearing only once a first booking exists.
 */
export function BookingCalendar({
  bookings,
  onSelectDate,
}: {
  bookings: Booking[];
  onSelectDate?: (date: string | null) => void;
}) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  // "Today" is the California calendar day, like every other date in the app.
  const todayStr = todayKey();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayStr.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    return map;
  }, [bookings]);

  const monthLabel = cursor.toLocaleDateString(dateLocale, { year: "numeric", month: "long" });
  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();

  const weekdayLabels = useMemo(() => {
    // Week starts Sunday, matching the grid below.
    const base = new Date(2024, 8, 1);
    return Array.from({ length: 7 }, (_, i) =>
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i).toLocaleDateString(dateLocale, {
        weekday: "short",
      }),
    );
  }, [dateLocale]);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function pick(dateKey: string) {
    const next = selected === dateKey ? null : dateKey;
    setSelected(next);
    onSelectDate?.(next);
  }

  function shiftMonth(delta: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
    setSelected(null);
    onSelectDate?.(null);
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label={t("cal_prev_month")}
          className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-brand-950">{monthLabel}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label={t("cal_next_month")}
          className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-brand-500">
        {weekdayLabels.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`pad-${i}`} className="h-10" />;
          const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
          const key = ymd(date);
          const dayBookings = byDate.get(key) ?? [];
          const isToday = key === todayStr;
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              onClick={() => pick(key)}
              aria-label={`${key}${dayBookings.length ? ` · ${dayBookings.length}` : ""}`}
              aria-pressed={isSelected}
              className={cn(
                "flex h-10 flex-col items-center justify-center rounded-lg text-sm transition",
                isSelected
                  ? "bg-accent font-bold text-white"
                  : isToday
                    ? "bg-brand-100 font-bold text-brand-900"
                    : "text-brand-800 hover:bg-brand-50",
              )}
            >
              {day}
              <span
                className={cn(
                  "mt-0.5 h-1.5 w-1.5 rounded-full",
                  dayBookings.length
                    ? isSelected
                      ? "bg-white"
                      : "bg-accent"
                    : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-brand-500">
        {bookings.length === 0 ? t("cal_hint_empty") : t("cal_hint")}
      </p>
    </div>
  );
}
