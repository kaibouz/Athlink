"use client";

import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  DollarSign,
  MessageSquare,
  QrCode,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { bookingsForCoach, getDemoCoach } from "@/lib/coach-bookings";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  DashboardGoalRings,
  RevenueLineChart,
} from "@/components/coach/DashboardCharts";
import { MyAthletesPanel } from "@/components/coach/MyAthletesPanel";
import type { BookingStatus } from "@/types";

const statusKey: Record<BookingStatus, MessageKey> = {
  pending: "status_pending",
  confirmed: "status_confirmed",
  completed: "status_completed",
  cancelled: "status_cancelled",
};

export default function CoachDashboardPage() {
  const { user, bookings } = useAuth();
  const { t, locale } = useLocale();
  const sampleCoach = getDemoCoach();
  const coachBookings = bookingsForCoach(bookings, sampleCoach.id);
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const upcoming = coachBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );

  const stats = [
    { label: t("dash_stat_bookings"), value: String(coachBookings.length), icon: Calendar },
    {
      label: t("dash_stat_revenue"),
      value: formatPrice(coachBookings.reduce((s, b) => s + b.price, 0)),
      icon: DollarSign,
    },
    { label: t("dash_stat_rating"), value: String(sampleCoach.rating), icon: Star },
    { label: t("dash_stat_reviews"), value: String(sampleCoach.reviewCount), icon: Users },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">{t("dash_title")}</h1>
          <p className="mt-1 text-brand-600">
            {user?.role === "coach"
              ? t("dash_sub", { name: user.name })
              : t("dash_sub_demo")}
          </p>
        </div>
        <Link href="/me">
          <Button variant="outline">{t("dash_edit")}</Button>
        </Link>
      </div>

      <div className="mt-8">
        <DashboardGoalRings bookings={coachBookings} />
      </div>

      <div className="mt-6">
        <RevenueLineChart bookings={coachBookings} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-brand-500">{s.label}</p>
                <Icon className="h-4 w-4 text-brand-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-950">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50/80 to-surface p-5 shadow-sm sm:p-6">
        <MyAthletesPanel />
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              <h2 className="font-bold text-brand-950">{t("dash_upcoming")}</h2>
            </div>
            <Link href="/coach/calendar" className="text-sm font-semibold text-brand-600">
              {t("coach_nav_calendar")}
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-brand-500">{t("dash_no_bookings")}</p>
            )}
            {upcoming.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-brand-50/80 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-brand-900">{b.athleteName}</p>
                  <p className="text-sm text-brand-600">
                    {formatDateJa(b.date, dateLocale)} · {b.startTime}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{t(statusKey[b.status])}</Badge>
                  <p className="mt-1 text-sm font-medium text-brand-800">
                    {formatPrice(b.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
          <h2 className="font-bold text-brand-950">{t("dash_sample")}</h2>
          <div className="mt-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sampleCoach.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-2xl bg-brand-50"
            />
            <div>
              <p className="font-bold text-brand-950">{sampleCoach.name}</p>
              <p className="text-sm text-brand-600">
                {sampleCoach.sport} · {formatPrice(sampleCoach.pricePerHour)}
                {t("per_hr")}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-brand-700">{sampleCoach.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/coaches/${sampleCoach.id}`}>
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
    </div>
  );
}
