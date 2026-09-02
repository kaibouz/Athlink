"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, QrCode } from "lucide-react";
import { CoachGate } from "@/components/coach/CoachGate";
import { useAuth } from "@/lib/store";
import { bookingsForCoach, getDemoCoach } from "@/lib/coach-bookings";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddToCalendarButtons } from "@/components/calendar/AddToCalendar";
import { LessonVenuePanel } from "@/components/maps/LessonVenuePanel";
import type { Booking, BookingStatus } from "@/types";

const statusKey: Record<BookingStatus, MessageKey> = {
  pending: "status_pending",
  confirmed: "status_confirmed",
  completed: "status_completed",
  cancelled: "status_cancelled",
};

const statusTone: Record<BookingStatus, string> = {
  pending: "border-amber-400 bg-amber-500/20 text-amber-100",
  confirmed: "border-emerald-400 bg-emerald-500/20 text-emerald-100",
  completed: "border-brand-300 bg-brand-500/20 text-brand-100",
  cancelled: "border-slate-400 bg-slate-500/20 text-slate-300",
};

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

function CalendarInner() {
  const { bookings, updateBookingStatus } = useAuth();
  const { t, locale } = useLocale();
  const coach = getDemoCoach();
  const coachBookings = bookingsForCoach(bookings, coach.id);

  const [cursor, setCursor] = useState(() => startOfMonth(new Date("2026-07-29")));
  const [selected, setSelected] = useState(toKey(new Date("2026-07-29")));

  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const weekdayLabels = useMemo(() => {
    const base = new Date(2026, 6, 5); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return new Intl.DateTimeFormat(dateLocale, { weekday: "short" }).format(d);
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

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of coachBookings) {
      if (b.status === "cancelled") continue;
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    return map;
  }, [coachBookings]);

  const dayBookings = (byDate.get(selected) ?? []).slice().sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  const todayKey = toKey(new Date("2026-07-29"));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">{t("cal_title")}</h1>
          <p className="mt-1 text-brand-600">{t("cal_sub")}</p>
        </div>
        <Link href="/coach/qr">
          <Button variant="outline">
            <QrCode className="h-4 w-4" />
            {t("coach_nav_qr")}
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-brand-100 bg-surface p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
              }
              aria-label={t("cal_prev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-bold text-brand-950">{monthLabel}</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
              }
              aria-label={t("cal_next")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-brand-500">
            {weekdayLabels.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              if (!cell.key || cell.day == null) {
                return <div key={`empty-${idx}`} className="min-h-16 rounded-xl" />;
              }
              const events = byDate.get(cell.key) ?? [];
              const isSelected = cell.key === selected;
              const isToday = cell.key === todayKey;
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelected(cell.key!)}
                  className={`min-h-16 rounded-xl border p-1.5 text-left transition ${
                    isSelected
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                      : isToday
                        ? "border-brand-400 bg-brand-50 text-brand-950"
                        : "border-transparent bg-brand-50/50 text-brand-900 hover:border-brand-200"
                  }`}
                >
                  <span className="text-xs font-bold">{cell.day}</span>
                  <div className="mt-1 space-y-0.5">
                    {events.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                          isSelected ? statusTone[e.status] : "bg-surface/90 text-brand-700"
                        }`}
                      >
                        {e.startTime} {e.athleteName}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <p
                        className={`text-[10px] ${isSelected ? "text-white/80" : "text-brand-500"}`}
                      >
                        +{events.length - 2}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-brand-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> {t("status_pending")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> {t("status_confirmed")}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
          <h2 className="font-bold text-brand-950">
            {new Intl.DateTimeFormat(dateLocale, {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date(`${selected}T00:00:00`))}
          </h2>
          <p className="mt-1 text-sm text-brand-500">
            {dayBookings.length === 0
              ? t("cal_day_empty")
              : t("cal_day_count", { count: dayBookings.length })}
          </p>

          <div className="mt-4 space-y-3">
            {dayBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-brand-100 bg-brand-50/60 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-brand-950">{b.athleteName}</p>
                    <p className="text-sm text-brand-600">
                      {b.startTime}–{b.endTime} · {formatPrice(b.price)}
                    </p>
                    {b.note && (
                      <p className="mt-1 text-xs text-brand-500">{b.note}</p>
                    )}
                  </div>
                  <Badge>{t(statusKey[b.status])}</Badge>
                </div>
                {b.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => updateBookingStatus(b.id, "confirmed")}
                    >
                      {t("quickbar_confirm")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateBookingStatus(b.id, "cancelled")}
                    >
                      {t("quickbar_decline")}
                    </Button>
                  </div>
                )}
                {(b.status === "confirmed" || b.status === "pending") && (
                  <div className="mt-3">
                    <AddToCalendarButtons booking={b} compact />
                  </div>
                )}
                {b.format === "in_person" && b.status !== "cancelled" && (
                  <div className="mt-3">
                    <LessonVenuePanel booking={b} compact />
                  </div>
                )}
                {b.status === "confirmed" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => updateBookingStatus(b.id, "completed")}
                  >
                    {t("cal_mark_done")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function CoachCalendarPage() {
  return (
    <CoachGate>
      <CalendarInner />
    </CoachGate>
  );
}
