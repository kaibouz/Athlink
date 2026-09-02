"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  DollarSign,
  MessageSquare,
  QrCode,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { bookingsForCoach } from "@/lib/coach-bookings";
import { useMyCoach } from "@/lib/use-my-coach";
import { getReviewsByCoach } from "@/lib/data";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { loc, sportLabel } from "@/lib/i18n/localize";
import type { MessageKey } from "@/lib/i18n/messages";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageContainer, PageHeader } from "@/components/layout/PageShell";
import {
  DashboardGoalRings,
} from "@/components/coach/DashboardCharts";
import type { BookingStatus } from "@/types";

export default function CoachDashboardPage() {
  const { user, bookings } = useAuth();
  const { t, locale } = useLocale();
  const [bookingsExpanded, setBookingsExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const { coach, loading: coachLoading, hasProfile } = useMyCoach();
  const coachReviews = coach ? getReviewsByCoach(coach.id) : [];
  const coachBookings = bookingsForCoach(bookings, coach?.id);
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const upcoming = coachBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );

  const statusKey: Record<BookingStatus, MessageKey> = {
    pending: "status_pending",
    confirmed: "status_confirmed",
    completed: "status_completed",
    cancelled: "status_cancelled",
  };

  if (coachLoading) {
    return (
      <PageContainer className="py-16 text-center text-brand-500">{t("loading")}</PageContainer>
    );
  }

  if (!hasProfile || !coach) {
    return (
      <PageContainer className="py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("register_prompt_title")}</h1>
        <p className="mt-2 text-brand-600">{t("register_prompt_body")}</p>
        <Link href="/coach/register" className="mt-6 inline-block">
          <Button size="lg">{t("register_submit")}</Button>
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("dash_title")}
        description={
          user?.role === "coach"
            ? t("dash_sub", { name: user.name })
            : t("dash_sub_demo")
        }
        actions={
          <Link href="/me">
            <Button variant="outline">{t("dash_edit")}</Button>
          </Link>
        }
      />

      <div className="mt-2">
        <DashboardGoalRings bookings={coachBookings} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          aria-expanded={bookingsExpanded}
          onClick={() => setBookingsExpanded((v) => !v)}
          className={`rounded-2xl border bg-surface p-5 text-left shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${
            bookingsExpanded ? "sm:col-span-2 lg:col-span-3" : ""
          } ${
            bookingsExpanded
              ? "border-brand-300 ring-2 ring-brand-200"
              : "border-brand-100 hover:border-brand-200 hover:bg-brand-50/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-500">{t("dash_stat_bookings")}</p>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-400" />
              <ChevronDown
                className={`h-4 w-4 text-brand-400 transition-transform ${
                  bookingsExpanded ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-950">{coachBookings.length}</p>

          {bookingsExpanded && (
            <div className="mt-4 border-t border-brand-100 pt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-brand-950">{t("dash_upcoming")}</h3>
                <Link
                  href="/coach/calendar"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-brand-600"
                >
                  {t("coach_nav_calendar")}
                </Link>
              </div>
              <ul className="mt-3 max-h-64 divide-y divide-brand-100 overflow-y-auto rounded-xl border border-brand-100 bg-brand-50/40">
                {upcoming.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-brand-500">
                    {t("dash_no_bookings")}
                  </li>
                )}
                {upcoming.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-900">{b.athleteName}</p>
                      <p className="text-sm text-brand-600">
                        {formatDateJa(b.date, dateLocale)} · {b.startTime}
                      </p>
                      {b.note && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-brand-500">{b.note}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge>{t(statusKey[b.status])}</Badge>
                      <p className="mt-1 text-sm font-medium tabular-nums text-brand-800">
                        {formatPrice(b.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </button>

        <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-500">{t("dash_stat_revenue")}</p>
            <DollarSign className="h-4 w-4 text-brand-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-950">
            {formatPrice(coachBookings.reduce((s, b) => s + b.price, 0))}
          </p>
        </div>

        <button
          type="button"
          aria-expanded={reviewsExpanded}
          onClick={() => setReviewsExpanded((v) => !v)}
          className={`rounded-2xl border bg-surface p-5 text-left shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:col-span-2 lg:col-span-1 ${
            reviewsExpanded ? "sm:col-span-2 lg:col-span-3" : ""
          } ${
            reviewsExpanded
              ? "border-brand-300 ring-2 ring-brand-200"
              : "border-brand-100 hover:border-brand-200 hover:bg-brand-50/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-500">
              {t("dash_stat_rating")} · {t("dash_stat_reviews")}
            </p>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-brand-400" />
              <ChevronDown
                className={`h-4 w-4 text-brand-400 transition-transform ${
                  reviewsExpanded ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </div>
          </div>
          <div className="mt-2 flex items-end gap-5">
            <div>
              <p className="text-2xl font-bold text-brand-950">{coach.rating}</p>
              <p className="mt-0.5 text-xs text-brand-500">{t("dash_stat_rating")}</p>
            </div>
            <div className="mb-2 h-8 w-px bg-brand-100" aria-hidden />
            <div>
              <p className="text-2xl font-bold text-brand-950">{coach.reviewCount}</p>
              <p className="mt-0.5 text-xs text-brand-500">{t("dash_stat_reviews")}</p>
            </div>
          </div>

          {reviewsExpanded && (
            <div className="mt-4 border-t border-brand-100 pt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-brand-950">{t("dash_reviews_voice")}</h3>
                <Link
                  href={`/coaches/${coach.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-brand-600"
                >
                  {t("dash_reviews_view_all")}
                </Link>
              </div>
              <ul className="mt-3 max-h-72 divide-y divide-brand-100 overflow-y-auto rounded-xl border border-brand-100 bg-brand-50/40">
                {coachReviews.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-brand-500">
                    {t("coach_no_reviews")}
                  </li>
                )}
                {coachReviews.map((r) => (
                  <li key={r.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-brand-900">{r.authorName}</span>
                      <span className="flex items-center gap-0.5 text-sm text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {r.rating}
                      </span>
                      <Badge variant="neutral">{r.athleteLevel}</Badge>
                      <span className="text-xs text-brand-400">
                        {formatDateJa(r.date, dateLocale)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-brand-700">
                      {loc(locale, r.comment)}
                    </p>
                  </li>
                ))}
              </ul>
              {coachReviews.length > 0 && coachReviews.length < coach.reviewCount && (
                <p className="mt-2 text-center text-xs text-brand-500">
                  {t("dash_reviews_more", {
                    n: coach.reviewCount - coachReviews.length,
                  })}
                </p>
              )}
            </div>
          )}
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/coach/calendar"
          className="rounded-2xl border border-brand-200 bg-gradient-to-br from-sky-50 to-surface p-5 shadow-sm transition hover:border-sky-400"
        >
          <div className="flex items-center gap-2 text-sky-800">
            <CalendarDays className="h-5 w-5" />
            <h2 className="font-bold">{t("dash_calendar_cta")}</h2>
          </div>
          <p className="mt-2 text-sm text-brand-600">{t("dash_calendar_desc")}</p>
        </Link>
        <Link
          href="/coach/qr"
          className="rounded-2xl border border-brand-200 bg-gradient-to-br from-violet-50 to-surface p-5 shadow-sm transition hover:border-violet-400"
        >
          <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300">
            <QrCode className="h-5 w-5" />
            <h2 className="font-bold">{t("dash_qr_cta")}</h2>
          </div>
          <p className="mt-2 text-sm text-brand-600">{t("dash_qr_desc")}</p>
        </Link>
        <Link
          href="/coach/feedback"
          className="rounded-2xl border border-brand-200 bg-gradient-to-br from-emerald-50 to-surface p-5 shadow-sm transition hover:border-emerald-400"
        >
          <div className="flex items-center gap-2 text-emerald-700">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-bold">{t("dash_feedback_cta")}</h2>
          </div>
          <p className="mt-2 text-sm text-brand-600">{t("dash_feedback_desc")}</p>
        </Link>
      </div>

      <div className="mt-8">
        <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
          <h2 className="font-bold text-brand-950">{t("dash_sample")}</h2>
          <div className="mt-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coach.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-2xl bg-brand-50"
            />
            <div>
              <p className="font-bold text-brand-950">{coach.name}</p>
              <p className="text-sm text-brand-600">
                {sportLabel(t, coach.sport)} · {formatPrice(coach.pricePerHour)}
                {t("per_hr")}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-brand-700">
            {loc(locale, coach.bio)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/coaches/${coach.id}`}>
              <Button variant="secondary" size="sm">
                {t("dash_view_public")}
              </Button>
            </Link>
            <Link href="/coach/qr">
              <Button size="sm">
                <QrCode className="h-4 w-4" />
                {t("coach_nav_qr")}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
