"use client";

import Link from "next/link";
import { CalendarDays, Check, QrCode, X } from "lucide-react";
import { useAuth } from "@/lib/store";
import { pendingCoachBookings } from "@/lib/coach-bookings";
import { useMyCoach } from "@/lib/use-my-coach";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";

/** Sticky coach bar: confirm pending bookings fast + jump to calendar / QR */
export function BookingQuickBar() {
  const { user, bookings, updateBookingStatus } = useAuth();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  if (user?.role !== "coach") return null;

  const { coach } = useMyCoach();
  const pending = pendingCoachBookings(bookings, coach?.id);
  const next = pending[0];

  return (
    <div className="sticky top-16 z-30 border-b border-brand-200 bg-ink text-white shadow-md md:top-[4.5rem]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-sky-300 uppercase">
            {t("quickbar_label")}
          </p>
          {next ? (
            <p className="mt-0.5 truncate text-sm font-medium">
              {t("quickbar_pending", { count: pending.length })} — {next.athleteName} ·{" "}
              {formatDateJa(next.date, dateLocale)} {next.startTime} · {formatPrice(next.price)}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-slate-300">{t("quickbar_clear")}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {next && (
            <>
              <Button
                size="sm"
                className="bg-emerald-500 text-white hover:bg-emerald-400"
                onClick={() => updateBookingStatus(next.id, "confirmed")}
              >
                <Check className="h-4 w-4" />
                {t("quickbar_confirm")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => updateBookingStatus(next.id, "cancelled")}
              >
                <X className="h-4 w-4" />
                {t("quickbar_decline")}
              </Button>
            </>
          )}
          <Link href="/coach/calendar">
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <CalendarDays className="h-4 w-4" />
              {t("coach_nav_calendar")}
            </Button>
          </Link>
          <Link href="/coach/qr">
            <Button size="sm" className="bg-brand-500 hover:bg-brand-400">
              <QrCode className="h-4 w-4" />
              {t("coach_nav_qr")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
