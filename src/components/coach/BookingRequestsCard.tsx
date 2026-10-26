"use client";

import { useState } from "react";
import { Check, MapPin, Video, X } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { formatDateJa, formatPrice, formatTimeRange } from "@/lib/utils";
import { isNotOver } from "@/lib/dates";
import { ONLINE_LOCATION } from "@/lib/coach-taxonomy";
import type { Booking } from "@/types";

/**
 * The coach's inbox of lesson requests. Every new booking arrives here as
 * "requested"; nothing is on the calendar until the coach accepts it.
 */
export function BookingRequestsCard({ bookings }: { bookings: Booking[] }) {
  const { updateBookingStatus } = useAuth();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const requests = bookings
    .filter((b) => b.status === "pending" && isNotOver(b.date, b.endTime))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  async function decide(b: Booking, next: "confirmed" | "declined") {
    setBusy(b.id);
    setFailed(null);
    const ok = await updateBookingStatus(b.id, next);
    if (!ok) setFailed(b.id);
    setBusy(null);
  }

  return (
    <div className="mx-card mb-3">
      <div className="mx-t">
        {t("coach_requests_title")}
        {requests.length > 0 ? ` · ${requests.length}` : ""}
      </div>
      {requests.length === 0 ? (
        <p className="text-sm text-[color:var(--mx-dim)]">{t("quickbar_clear")}</p>
      ) : (
        <div className="space-y-2">
          {requests.map((b) => (
            <div key={b.id} className="rounded-xl border border-[color:var(--mx-border)] bg-[color:var(--mx-panel-2)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <b className="block text-[0.9rem] text-[color:var(--mx-text)]">{b.athleteName}</b>
                  <span className="block text-[0.78rem] text-[color:var(--mx-dim)]">
                    {formatDateJa(b.date, dateLocale)} · {formatTimeRange(b.startTime, b.endTime, locale)}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[0.75rem] text-[color:var(--mx-dimmer)]">
                    {b.format === "online" || b.location === ONLINE_LOCATION ? (
                      <Video className="h-3 w-3" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    {b.location && b.location !== ONLINE_LOCATION
                      ? b.location
                      : b.format === "online"
                        ? t("search_online")
                        : t("search_in_person")}
                  </span>
                  {b.note ? <span className="mt-1 block text-[0.75rem] text-[color:var(--mx-dim)]">“{b.note}”</span> : null}
                </div>
                <span className="shrink-0 text-sm font-bold text-[color:var(--mx-text)]">{formatPrice(b.price)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busy === b.id}
                  onClick={() => void decide(b, "confirmed")}
                  className="mx-btn mx-btn-accent flex-1 border-0 text-[0.8rem]"
                >
                  <Check className="h-4 w-4" />
                  {t("quickbar_confirm")}
                </button>
                <button
                  type="button"
                  disabled={busy === b.id}
                  onClick={() => void decide(b, "declined")}
                  className="mx-btn mx-btn-ghost flex-1 text-[0.8rem]"
                >
                  <X className="h-4 w-4" />
                  {t("quickbar_decline")}
                </button>
              </div>
              {failed === b.id ? <p className="mt-2 text-xs text-rose-400">{t("booking_failed")}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
