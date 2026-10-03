"use client";

import { isNotOver, monthKey, todayKey } from "@/lib/dates";
import Link from "next/link";
import { CalendarDays, MapPin, MessageSquare, Navigation, Play, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { formatDateJa } from "@/lib/utils";
import { venueForBooking, venueMapLinks } from "@/lib/lesson-venues";
import { useApi } from "@/lib/client/use-api";
import { ProUpgradeBanner, usePlatformPlan } from "@/components/plans/PlanComparison";
import type { AthleteProgress, Booking, ProgressMetric } from "@/types";

/** Metrics where a lower value is an improvement (delta arrow flips). */
const LOWER_BETTER = new Set(["pop_time", "sixty_time", "swing_length", "first_step", "transfer"]);

function DeltaTag({ metric }: { metric: ProgressMetric }) {
  if (metric.delta === null || metric.delta === 0) return null;
  const improved = LOWER_BETTER.has(metric.metric) ? metric.delta < 0 : metric.delta > 0;
  const arrow = metric.delta > 0 ? "▲" : "▼";
  return (
    <span
      className="text-sm font-600"
      style={{ color: improved ? "var(--mx-green)" : "var(--mx-amber)" }}
    >
      {arrow}
      {Math.abs(metric.delta)}
    </span>
  );
}

/** Athlete Home — mobile concept: breakdown toast, next session, live stats, coach note, heat map */
export function AthleteHomeScreen() {
  const { user, bookings } = useAuth();
  const { t, locale } = useLocale();
  const { isPro } = usePlatformPlan();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const { data } = useApi<{ progress: AthleteProgress | null }>(user ? "/api/me/progress" : null);
  const progress = data?.progress ?? null;

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("nav_home")}</h1>
        <p className="mt-2 text-[var(--mx-dim)]">{t("bookings_login_hint")}</p>
        <Link href="/sign-in?redirect_url=/home" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  const today = todayKey();
  // Fallback when progress hasn't loaded: the soonest open booking from today
  // on — not just the first open one in the list, which could be in the past.
  const next =
    progress?.nextSession ??
    bookings
      .filter((b) => (b.status === "pending" || b.status === "confirmed") && isNotOver(b.date, b.endTime))
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0] ??
    null;
  const nextVenue = next ? venueForBooking(next) : null;
  // App "calendar": every open booking still ahead, as a run-sheet list.
  const upcoming = bookings
    .filter(
      (b) =>
        (b.status === "pending" || b.status === "confirmed") &&
        isNotOver(b.date, b.endTime) &&
        b.id !== next?.id,
    )
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 6);
  const first = user.name.split(" ")[0] || user.name;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const weekday = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const headline = progress?.headline ?? [];
  const topMetric = headline[0] ?? null;

  const monthPrefix = monthKey();
  const monthBookings = bookings.filter(
    (b) => b.date.startsWith(monthPrefix) && b.status !== "cancelled",
  );
  const sessionsBooked = monthBookings.length;
  const sessionsDone = monthBookings.filter(
    (b) => b.status === "completed" || !isNotOver(b.date, b.endTime),
  ).length;
  const monthLabel = new Date().toLocaleDateString(dateLocale, { month: "short" });
  const coachNote = progress?.reportCards?.[0] ?? null;
  const breakdown = progress?.latestBreakdown ?? null;

  return (
    <div className="mx-app mx-route-texture w-full px-4 py-6 sm:px-6 lg:px-8">
      {breakdown && (
        <Link href={`/breakdown/${breakdown.id}`} className="mx-toast mb-3 block">
          <span className="mx-toast-ic">
            <Play className="h-3.5 w-3.5" />
          </span>
          <div>
            <b className="text-[0.75rem]">
              {t("mx_breakdown_ready", {
                kind: t(
                  breakdown.title.toLowerCase().includes("delivery")
                    ? "mx_kind_delivery"
                    : "mx_kind_swing",
                ),
              })}
            </b>
            <span className="block text-[0.7rem] text-[var(--mx-dimmer)]">
              {t("mx_processed_in", { seconds: breakdown.processedSeconds })}
            </span>
          </div>
        </Link>
      )}

      <Link href="/breakdown/new" className="mx-btn mx-btn-accent mb-4 w-full border-0 lg:max-w-sm">
        <Sparkles className="h-4 w-4" />
        {t("mx_analyze_clip")}
      </Link>

      <header className="mx-hdr">
        <div>
          <h1>{t("mx_greeting", { name: first })}</h1>
          <small>{weekday}</small>
        </div>
        <div className="mx-avatar" aria-hidden>
          {initials}
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-12 lg:items-start">
        <div className="space-y-3 lg:col-span-7">
          {next ? (
            <div className="mx-card">
              <div className="mx-t">
                {t("mx_next_session")} ·{" "}
                {next.date === today
                  ? t("mx_today")
                  : formatDateJa(next.date, dateLocale)}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[0.95rem] font-bold">{next.coachName}</div>
                  <div className="mt-0.5 text-[0.75rem] text-[var(--mx-dimmer)]">
                    {next.format === "online" ? t("mx_online") : t("mx_in_person")} ·{" "}
                    {formatDateJa(next.date, dateLocale)} · {next.startTime}–{next.endTime}
                  </div>
                  <span className={`mx-pill mt-2 ${next.status === "confirmed" ? "mx-pill-green" : "mx-pill-amber"}`}>
                    {next.status === "confirmed" ? t("mx_confirmed") : t("mx_pending")}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/messages" className="mx-btn mx-btn-ghost text-[0.75rem]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {t("mx_message")}
                </Link>
                {nextVenue ? (
                  <a
                    href={venueMapLinks(nextVenue).directionsGoogle}
                    target="_blank"
                    rel="noreferrer"
                    className="mx-btn mx-btn-ghost text-[0.75rem]"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    {t("mx_directions")}
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mx-card">
              <div className="mx-t">{t("mx_next_session")}</div>
              <p className="text-sm text-[var(--mx-dim)]">{t("bookings_empty")}</p>
              <Link href="/search" className="mx-btn mx-btn-accent mt-3 inline-flex">
                {t("bookings_find")}
              </Link>
            </div>
          )}

          {coachNote && (
            <div className="mx-card">
              <div className="mx-t">{t("mx_coach_says")}</div>
              <p className="text-sm leading-relaxed text-[var(--mx-text)]">“{coachNote.body}”</p>
              <div className="mt-2 text-[0.7rem] text-[var(--mx-dimmer)]">
                {t("mx_report_card")} · {coachNote.coachName} · {formatDateJa(coachNote.createdAt.slice(0, 10), dateLocale)}
              </div>
            </div>
          )}

          <div className="mx-card">
            <div className="mb-2 flex items-center justify-between">
              <div className="mx-t !mb-0">{t("mx_upcoming_bookings")}</div>
              <Link href="/bookings" className="text-[0.7rem] font-semibold text-[var(--mx-blue-2)] hover:underline">
                {t("mx_view_all")}
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="flex items-center justify-between gap-3 py-1">
                <p className="text-[0.8rem] text-[var(--mx-dimmer)]">{t("mx_no_upcoming")}</p>
                <Link href="/search" className="mx-btn mx-btn-ghost shrink-0 text-[0.75rem]">
                  {t("bookings_find")}
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((b) => {
                  const d = new Date(`${b.date}T00:00:00`);
                  return (
                    <Link
                      key={b.id}
                      href="/bookings"
                      className="mx-li !bg-[color:var(--mx-panel-2)] transition hover:border-[color:var(--mx-border-strong)]"
                    >
                      <div className="w-11 shrink-0 text-center leading-none">
                        <span className="!block !text-[0.6rem] font-semibold uppercase tracking-wide">
                          {d.toLocaleDateString(dateLocale, { weekday: "short" })}
                        </span>
                        <b className="mt-1 !text-[1.15rem] tabular-nums">{d.getDate()}</b>
                        <span className="!block !text-[0.6rem]">
                          {d.toLocaleDateString(dateLocale, { month: "short" })}
                        </span>
                      </div>
                      <div className="mx-w">
                        <b>{b.coachName}</b>
                        <span>
                          {b.startTime}–{b.endTime} ·{" "}
                          {b.format === "online" ? t("mx_online") : t("mx_in_person")}
                        </span>
                      </div>
                      {/* div, not span: .mx-li span would grey the pill out */}
                      <div
                        className={`mx-pill shrink-0 ${b.status === "confirmed" ? "mx-pill-green" : "mx-pill-amber"}`}
                      >
                        {b.status === "confirmed" ? t("mx_confirmed") : t("mx_pending")}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-5">
          {/* Deck pairs one headline metric with the month's session count. */}
          <div className="mx-stat-grid">
            {topMetric ? (
              <div className="mx-card">
                <div className="mx-t">{topMetric.label}</div>
                <div className="mx-big">
                  {topMetric.latest} <DeltaTag metric={topMetric} />
                </div>
                {topMetric.unit ? (
                  <div className="mt-1 text-[0.65rem] text-[var(--mx-dimmer)]">
                    {topMetric.unit}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mx-card">
                <div className="mx-t">{t("mx_exit_velo")}</div>
                <div className="mx-big">—</div>
              </div>
            )}

            <Link href="/bookings" className="mx-card block">
              <div className="mx-t flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--mx-blue-2)]" />
                {t("mx_sessions_month", { month: monthLabel })}
              </div>
              <div className="mx-big">
                {sessionsDone}
                <span className="text-[0.9rem] font-600 text-[var(--mx-dimmer)]">
                  /{sessionsBooked}
                </span>
              </div>
              <div className="mt-1 text-[0.65rem] text-[var(--mx-dimmer)]">
                {t("mx_sessions_completed")}
              </div>
              <MonthMini
                today={today}
                bookings={monthBookings}
                locale={dateLocale}
                doneLabel={t("mx_cal_done")}
                upcomingLabel={t("mx_cal_upcoming")}
              />
            </Link>
          </div>

          <div className="flex gap-2">
            <Link href="/bookings" className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
              <MapPin className="h-3.5 w-3.5" />
              {t("mx_all_bookings")}
            </Link>
            <Link href="/progress" className="mx-btn mx-btn-accent flex-1 text-[0.75rem]">
              {t("mx_progress")}
            </Link>
          </div>

          {!isPro ? <ProUpgradeBanner /> : null}
        </div>
      </div>
    </div>
  );
}

/**
 * This month at a glance: a small calendar with lesson days marked — filled
 * for sessions already done, outlined for ones still ahead, today ringed.
 */
function MonthMini({
  today,
  bookings,
  locale,
  doneLabel,
  upcomingLabel,
}: {
  today: string;
  bookings: Booking[];
  locale: string;
  doneLabel: string;
  upcomingLabel: string;
}) {
  const [y, m] = today.split("-").map(Number);
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const byDay = new Map<number, "done" | "upcoming">();
  for (const b of bookings) {
    const day = Number(b.date.slice(8, 10));
    const done = b.status === "completed" || !isNotOver(b.date, b.endTime);
    if (done || !byDay.has(day)) byDay.set(day, done ? "done" : "upcoming");
  }

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2026, 1, 1 + i)).toLocaleDateString(locale, { weekday: "narrow", timeZone: "UTC" }),
  );
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const todayDay = Number(today.slice(8, 10));

  return (
    <div className="mt-3 max-w-[210px]" aria-hidden>
      <div className="grid grid-cols-7 gap-[3px] text-center text-[0.55rem] font-semibold text-[var(--mx-dimmer)]">
        {weekdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-[2px]">
        {cells.map((day, i) => {
          if (day === null) return <span key={`pad-${i}`} />;
          const state = byDay.get(day);
          return (
            <span
              key={day}
              className={[
                "flex h-[18px] items-center justify-center rounded-[4px] text-[0.55rem] tabular-nums",
                state === "done"
                  ? "bg-gradient-to-br from-[var(--mx-blue-1)] to-[var(--mx-blue-2)] font-bold text-white"
                  : state === "upcoming"
                    ? "border border-[var(--mx-amber)] font-bold text-[var(--mx-amber)]"
                    : day < todayDay
                      ? "text-[color:rgba(255,255,255,0.22)]"
                      : "text-[var(--mx-dim)]",
                day === todayDay ? "ring-1 ring-white/80 ring-offset-1 ring-offset-[var(--mx-panel)]" : "",
              ].join(" ")}
            >
              {day}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.6rem] text-[var(--mx-dimmer)]">
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-[2px] bg-gradient-to-br from-[var(--mx-blue-1)] to-[var(--mx-blue-2)]" />
          {doneLabel}
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-2 w-2 rounded-[2px] border border-[var(--mx-amber)]" />
          {upcomingLabel}
        </span>
      </div>
    </div>
  );
}
