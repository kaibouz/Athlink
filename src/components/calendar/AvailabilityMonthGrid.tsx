"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TimeSlot } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export type DayAvailability = "open" | "few" | "full" | "off" | "past";

function classifyDay(
  key: string,
  openCount: number,
  totalCount: number,
  todayKey: string,
): DayAvailability {
  if (key < todayKey) return "past";
  if (totalCount === 0) return "off";
  if (openCount >= 3) return "open";
  if (openCount >= 1) return "few";
  return "full";
}

/** Concept Book month grid — cyan=open, amber=few, hollow=full, green corner=booked */
export function AvailabilityMonthGrid({
  slots,
  selectedDate,
  onSelectDate,
  bookedDates = [],
  compact = false,
}: {
  slots: TimeSlot[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** Dates the athlete already has a session (green corner dot) */
  bookedDates?: string[];
  compact?: boolean;
}) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const todayKey = toKey(new Date());

  const slotsByDate = useMemo(() => {
    const map = new Map<string, { open: number; total: number }>();
    for (const s of slots) {
      const prev = map.get(s.date) ?? { open: 0, total: 0 };
      prev.total += 1;
      if (s.available) prev.open += 1;
      map.set(s.date, prev);
    }
    return map;
  }, [slots]);

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const initialCursor = useMemo(() => {
    const seed = selectedDate || slots[0]?.date || todayKey;
    return startOfMonth(parseKey(seed));
  }, [selectedDate, slots, todayKey]);

  const [cursor, setCursor] = useState(initialCursor);

  const weekdayLabels = useMemo(() => {
    const base = new Date(2026, 6, 5); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return new Intl.DateTimeFormat(dateLocale, { weekday: "narrow" }).format(d);
    });
  }, [dateLocale]);

  const monthLabel = new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "long",
  }).format(cursor);

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const total = daysInMonth(cursor);
    const startPad = first.getDay();
    const items: { key: string | null; day: number | null }[] = [];
    for (let i = 0; i < startPad; i++) items.push({ key: null, day: null });
    for (let day = 1; day <= total; day++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      items.push({ key: toKey(d), day });
    }
    while (items.length % 7 !== 0) items.push({ key: null, day: null });
    return items;
  }, [cursor]);

  function shiftMonth(delta: number) {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div className={cn("mx-cal", compact && "mx-cal-compact")}>
      <div className="mx-cal-top">
        <b>{monthLabel}</b>
        <div className="mx-cal-nav">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-cal-dow">
        {weekdayLabels.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>

      <div className="mx-cal-grid">
        {cells.map((cell, i) => {
          if (!cell.key || cell.day == null) {
            return <span key={`pad-${i}`} className="mx-day mx-day-empty" />;
          }
          const counts = slotsByDate.get(cell.key) ?? { open: 0, total: 0 };
          const status = classifyDay(cell.key, counts.open, counts.total, todayKey);
          const selected = cell.key === selectedDate;
          const booked = bookedSet.has(cell.key);
          const selectable = status === "open" || status === "few" || booked;

          return (
            <button
              key={cell.key}
              type="button"
              disabled={!selectable && !booked}
              className={cn(
                "mx-day",
                `mx-day-${status}`,
                selected && "mx-day-sel",
                booked && "mx-day-booked",
              )}
              onClick={() => onSelectDate(cell.key!)}
            >
              <b>{cell.day}</b>
            </button>
          );
        })}
      </div>

      <div className="mx-cal-legend">
        <span>
          <i className="mx-leg mx-leg-open" />
          {t("cal_leg_open")}
        </span>
        <span>
          <i className="mx-leg mx-leg-few" />
          {t("cal_leg_few")}
        </span>
        <span>
          <i className="mx-leg mx-leg-full" />
          {t("cal_leg_full")}
        </span>
        <span>
          <i className="mx-leg mx-leg-booked" />
          {t("cal_leg_booked")}
        </span>
      </div>
    </div>
  );
}
