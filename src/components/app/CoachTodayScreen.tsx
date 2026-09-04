"use client";

import Link from "next/link";
import { CalendarDays, MessageSquare, QrCode } from "lucide-react";
import { useAuth } from "@/lib/store";
import { bookingsForCoach } from "@/lib/coach-bookings";
import { useMyCoach } from "@/lib/use-my-coach";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import type { Booking } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function noteFor(booking: Booking) {
  if (booking.note?.trim()) return booking.note.trim();
  return "Review last swing notes before warm-up.";
}

/** Coach Today — run sheet, money glance, pre-session athlete breakdown */
export function CoachTodayScreen() {
  const { user, bookings } = useAuth();
  const { t, locale } = useLocale();
  const { coach, loading: coachLoading, hasProfile } = useMyCoach();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  if (coachLoading) {
    return (
      <div className="mx-app mx-auto max-w-2xl px-4 py-16 text-center text-[color:var(--mx-dim)]">
        {t("loading")}
      </div>
    );
  }

  if (!hasProfile || !coach) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("register_prompt_title")}</h1>
        <p className="mt-2 text-[color:var(--mx-dim)]">{t("register_prompt_body")}</p>
        <Link href="/coach/register" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("register_submit")}</Button>
        </Link>
      </div>
    );
  }

  const coachBookings = bookingsForCoach(bookings, coach.id);
  const active = coachBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );
  const runSheet = [...active].sort((a, b) =>
    `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
  );
  const confirmedTotal = coachBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + b.price, 0);
  const pendingTotal = coachBookings
    .filter((b) => b.status === "pending")
    .reduce((s, b) => s + b.price, 0);

  const weekday = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const first = (user?.name ?? coach.name).split(" ")[0];

  return (
    <div className="mx-app mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="mx-hdr">
        <div>
          <h1>{t("dash_today_title")}</h1>
          <small>
            {first} · {weekday}
          </small>
        </div>
        <div className="mx-avatar mx-avatar-coach" aria-hidden>
          {initials(coach.name)}
        </div>
      </header>

      <div className="mx-stat-grid mb-3">
        <div className="mx-card">
          <div className="mx-t">{t("dash_today_money")}</div>
          <div className="mx-big">{formatPrice(confirmedTotal)}</div>
          <div className="mt-1 text-[0.7rem] text-[color:var(--mx-dimmer)]">
            {t("dash_today_earned")}
          </div>
        </div>
        <div className="mx-card">
          <div className="mx-t">{t("dash_today_pending_pay")}</div>
          <div className="mx-big text-[color:var(--mx-amber)]">{formatPrice(pendingTotal)}</div>
          <div className="mt-1 text-[0.7rem] text-[color:var(--mx-dimmer)]">
            {active.filter((b) => b.status === "pending").length} requests
          </div>
        </div>
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">{t("dash_today_runsheet")}</div>
        {runSheet.length === 0 ? (
          <p className="text-sm text-[color:var(--mx-dim)]">{t("dash_today_no_sessions")}</p>
        ) : (
          <div className="space-y-2">
            {runSheet.map((b) => (
              <div key={b.id} className="mx-li !bg-[color:var(--mx-panel-2)]">
                <div className="mx-avatar" aria-hidden>
                  {initials(b.athleteName)}
                </div>
                <div className="mx-w">
                  <b>{b.athleteName}</b>
                  <span>
                    {formatDateJa(b.date, dateLocale)} · {b.startTime}–{b.endTime}
                  </span>
                </div>
                <div className="mx-r">
                  {formatPrice(b.price)}
                  <em>{b.status === "confirmed" ? "Ready" : "Pending"}</em>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {runSheet[0] ? (
        <div className="mx-card mb-3">
          <div className="mx-t">
            {t("dash_today_presession")} · {runSheet[0].athleteName}
          </div>
          <p className="text-sm leading-relaxed text-[color:var(--mx-text)]">
            “{noteFor(runSheet[0])}”
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/messages" className="mx-btn mx-btn-ghost text-[0.75rem]">
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </Link>
            <Link
              href={`/coach/students`}
              className="mx-btn mx-btn-accent text-[0.75rem]"
            >
              Open athlete
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2">
        <Link href="/coach/calendar" className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
          <CalendarDays className="h-3.5 w-3.5" />
          {t("coach_nav_calendar")}
        </Link>
        <Link href="/coach/qr" className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
          <QrCode className="h-3.5 w-3.5" />
          {t("coach_nav_qr")}
        </Link>
        <Link href="/me" className="mx-btn mx-btn-accent flex-1 text-[0.75rem]">
          {t("dash_edit")}
        </Link>
      </div>
    </div>
  );
}
