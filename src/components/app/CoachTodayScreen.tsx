"use client";

import { addDaysToKey, todayKey } from "@/lib/dates";
import Link from "next/link";
import { CalendarDays, MessageSquare, QrCode, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store";
import { bookingsForCoach } from "@/lib/coach-bookings";
import { useMyCoach } from "@/lib/use-my-coach";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/lib/client/use-api";
import type { AthleteProgress, Booking, StudentAthlete } from "@/types";

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

/** Coach Today — day-scoped run sheet, money glance, pre-session athlete breakdown */
export function CoachTodayScreen() {
  const { user, bookings } = useAuth();
  const { t, locale } = useLocale();
  const { coach, loading: coachLoading, hasProfile } = useMyCoach();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const today = todayKey();

  const { data: rosterData } = useApi<{ students: StudentAthlete[] }>(
    user?.role === "coach" ? "/api/coach/students" : null,
  );
  const roster = rosterData?.students ?? [];

  const { data: threadData } = useApi<{ threads: { unread?: number }[] }>(
    user?.role === "coach" ? "/api/messages" : null,
  );

  const coachBookings = coach ? bookingsForCoach(bookings, coach.id) : [];
  const todaysActive = coachBookings.filter(
    (b) => b.date === today && (b.status === "pending" || b.status === "confirmed"),
  );
  const runSheet = [...todaysActive].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const todayConfirmed = coachBookings
    .filter((b) => b.date === today && (b.status === "confirmed" || b.status === "completed"))
    .reduce((s, b) => s + b.price, 0);
  const todayPending = runSheet.filter((b) => b.status === "pending");
  const todayPendingTotal = todayPending.reduce((s, b) => s + b.price, 0);

  // Deck header reads "Wed, Sep 2 · 4 sessions · $310" and pairs a week-to-date
  // earnings tile with unread messages.
  const weekStart = (() => {
    const dow = new Date(`${today}T00:00:00Z`).getUTCDay();
    return addDaysToKey(today, -((dow + 6) % 7)); // Monday
  })();
  const weekEarnings = coachBookings
    .filter(
      (b) => b.date >= weekStart && (b.status === "confirmed" || b.status === "completed"),
    )
    .reduce((s, b) => s + b.price, 0);
  const unreadCount = threadData?.threads?.reduce((s, th) => s + (th.unread ?? 0), 0) ?? 0;

  const firstBooking = runSheet[0];
  const firstStudent = firstBooking
    ? roster.find((s) => s.userId === firstBooking.athleteId)
    : undefined;
  const { data: firstProgress } = useApi<{ progress: AthleteProgress | null }>(
    firstStudent ? `/api/coach/students/${firstStudent.id}/progress` : null,
  );
  const preBreakdown = firstProgress?.progress?.latestBreakdown ?? null;

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

  const weekday = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const athleteHref = firstStudent ? `/coach/students/${firstStudent.id}` : "/coach/students";

  return (
    <div className="mx-app mx-route-texture w-full px-4 py-6 sm:px-6 lg:px-8">
      <header className="mx-hdr">
        <div>
          <h1>{t("dash_today_title")}</h1>
          <small>
            {weekday} · {t("mx_sessions_count", { n: runSheet.length })} ·{" "}
            {formatPrice(todayConfirmed + todayPendingTotal)}
          </small>
        </div>
        <div className="mx-avatar mx-avatar-coach" aria-hidden>
          {initials(coach.name)}
        </div>
      </header>

      <div className="mx-stat-grid mb-3">
        <Link href="/coach/analytics" className="mx-card block">
          <div className="mx-t">{t("mx_this_week")}</div>
          <div className="mx-big">{formatPrice(weekEarnings)}</div>
          <div className="mt-1 text-[0.7rem] text-[color:var(--mx-dimmer)]">
            {t("mx_today_pending")} · {formatPrice(todayPendingTotal)}
          </div>
        </Link>
        <Link href="/messages" className="mx-card block">
          <div className="mx-t">{t("mx_unread")}</div>
          <div
            className={
              unreadCount > 0 ? "mx-big text-[color:var(--mx-blue-2)]" : "mx-big"
            }
          >
            {unreadCount}
          </div>
          <div className="mt-1 text-[0.7rem] text-[color:var(--mx-dimmer)]">
            {t("mx_requests_count", { n: todayPending.length })}
          </div>
        </Link>
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">{t("dash_today_runsheet")} · {t("mx_today")}</div>
        {runSheet.length === 0 ? (
          <p className="text-sm text-[color:var(--mx-dim)]">{t("dash_today_no_sessions")}</p>
        ) : (
          <div className="space-y-2">
            {runSheet.map((b) => {
              const s = roster.find((r) => r.userId === b.athleteId);
              const row = (
                <>
                  <div className="mx-avatar" aria-hidden>
                    {initials(b.athleteName)}
                  </div>
                  <div className="mx-w">
                    <b>{b.athleteName}</b>
                    <span>
                      {b.startTime}–{b.endTime}
                      {b.note ? ` · ${b.note}` : ""}
                    </span>
                  </div>
                  <div className="mx-r">
                    {formatPrice(b.price)}
                    <em>{b.status === "confirmed" ? "Ready" : "Pending"}</em>
                  </div>
                </>
              );
              return s ? (
                <Link
                  key={b.id}
                  href={`/coach/students/${s.id}`}
                  className="mx-li !bg-[color:var(--mx-panel-2)] transition hover:border-[color:var(--mx-border-strong)]"
                >
                  {row}
                </Link>
              ) : (
                <div key={b.id} className="mx-li !bg-[color:var(--mx-panel-2)]">
                  {row}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {firstBooking ? (
        <div className="mx-card mb-3">
          <div className="mx-t">{t("mx_pre_session")} · {firstBooking.athleteName}</div>
          <p className="text-sm leading-relaxed text-[color:var(--mx-text)]">
            “{noteFor(firstBooking)}”
          </p>
          {preBreakdown && (
            <div className="mt-2 flex flex-wrap gap-2">
              {preBreakdown.metrics.slice(0, 3).map((m) => (
                <span key={m.label} className="mx-pill mx-pill-accent">
                  {m.label} {m.value}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/messages" className="mx-btn mx-btn-ghost text-[0.75rem]">
              <MessageSquare className="h-3.5 w-3.5" />
              {t("mx_message")}
            </Link>
            {preBreakdown && (
              <Link
                href={`/breakdown/${preBreakdown.id}`}
                className="mx-btn mx-btn-ghost text-[0.75rem]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("mx_breakdown")}
              </Link>
            )}
            <Link href={athleteHref} className="mx-btn mx-btn-accent text-[0.75rem]">
              {t("mx_open_athlete")}
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
