"use client";

import Link from "next/link";
import { Calendar, MapPin, Video } from "lucide-react";
import { useAuth } from "@/lib/store";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AddToCalendarButtons,
  CalendarAutoPrefSelect,
} from "@/components/calendar/AddToCalendar";
import type { BookingStatus } from "@/types";

const statusKey: Record<BookingStatus, MessageKey> = {
  pending: "status_pending",
  confirmed: "status_confirmed",
  completed: "status_completed",
  cancelled: "status_cancelled",
};

export default function BookingsPage() {
  const { user, bookings, updateBookingStatus } = useAuth();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("bookings_title")}</h1>
        <p className="mt-2 text-brand-600">{t("bookings_login_hint")}</p>
        <Link href="/login?next=/bookings" className="mt-6 inline-block">
          <Button>{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">{t("bookings_title")}</h1>
      <p className="mt-1 text-brand-600">{t("bookings_sub", { name: user.name })}</p>

      <div className="mt-5 rounded-2xl border border-brand-100 bg-surface p-4 shadow-sm">
        <CalendarAutoPrefSelect />
      </div>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-surface p-12 text-center">
          <p className="font-medium text-brand-800">{t("bookings_empty")}</p>
          <Link href="/search" className="mt-4 inline-block">
            <Button>{t("bookings_find")}</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <article
              key={b.id}
              className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/coaches/${b.coachId}`}
                    className="text-lg font-bold text-brand-950 hover:text-brand-600"
                  >
                    {b.coachName}
                  </Link>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-600">
                    <Calendar className="h-4 w-4" />
                    {formatDateJa(b.date, dateLocale)} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                <Badge
                  variant={
                    b.status === "confirmed"
                      ? "verified"
                      : b.status === "cancelled"
                        ? "warning"
                        : "default"
                  }
                >
                  {t(statusKey[b.status])}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-brand-600">
                <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1">
                  {b.format === "online" ? (
                    <Video className="h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  {b.format === "online" ? t("search_online") : t("search_in_person")}
                </span>
                <span className="rounded-lg bg-brand-50 px-2.5 py-1">
                  {b.packageType === "single"
                    ? t("package_single")
                    : b.packageType === "pack"
                      ? t("package_pack")
                      : t("package_sub")}
                </span>
                <span className="rounded-lg bg-brand-50 px-2.5 py-1 font-semibold text-brand-800">
                  {formatPrice(b.price)}
                </span>
              </div>
              {b.note && (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-brand-700">
                  {b.note}
                </p>
              )}
              {b.status !== "cancelled" && b.status !== "completed" && (
                <div className="mt-4 space-y-3">
                  <AddToCalendarButtons booking={b} compact />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateBookingStatus(b.id, "completed")}
                    >
                      {t("bookings_complete")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateBookingStatus(b.id, "cancelled")}
                    >
                      {t("bookings_cancel")}
                    </Button>
                    <Link href="/messages">
                      <Button variant="secondary" size="sm">
                        {t("bookings_message")}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
