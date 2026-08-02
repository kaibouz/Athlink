"use client";

import { Apple, CalendarPlus, Check } from "lucide-react";
import type { Booking } from "@/types";
import {
  downloadAppleIcs,
  getCalendarAutoPref,
  openGoogleCalendar,
  setCalendarAutoPref,
  type CalendarAutoPref,
} from "@/lib/calendar";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export function AddToCalendarButtons({
  booking,
  compact = false,
  className,
}: {
  booking: Booking;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <div className={className ?? `flex flex-wrap gap-2 ${compact ? "" : "justify-center"}`}>
      <Button
        type="button"
        size={compact ? "sm" : "md"}
        variant="outline"
        onClick={() => openGoogleCalendar(booking)}
      >
        <CalendarPlus className="h-4 w-4" />
        {t("cal_add_google")}
      </Button>
      <Button
        type="button"
        size={compact ? "sm" : "md"}
        variant="secondary"
        onClick={() => downloadAppleIcs(booking)}
      >
        <Apple className="h-4 w-4" />
        {t("cal_add_apple")}
      </Button>
    </div>
  );
}

export function CalendarAutoPrefSelect({ className }: { className?: string }) {
  const { t } = useLocale();
  const [pref, setPref] = useState<CalendarAutoPref>("both");

  useEffect(() => {
    setPref(getCalendarAutoPref());
  }, []);

  function onChange(next: CalendarAutoPref) {
    setPref(next);
    setCalendarAutoPref(next);
  }

  return (
    <label className={className ?? "block text-left"}>
      <span className="mb-1.5 block text-sm font-medium text-brand-800">
        {t("cal_auto_label")}
      </span>
      <select
        value={pref}
        onChange={(e) => onChange(e.target.value as CalendarAutoPref)}
        className="h-11 w-full rounded-xl border border-brand-200 bg-surface px-3.5 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="both">{t("cal_auto_both")}</option>
        <option value="google">{t("cal_auto_google")}</option>
        <option value="apple">{t("cal_auto_apple")}</option>
        <option value="off">{t("cal_auto_off")}</option>
      </select>
      <p className="mt-1.5 text-xs text-brand-500">{t("cal_auto_hint")}</p>
    </label>
  );
}

export function CalendarSyncedNote() {
  const { t } = useLocale();
  return (
    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
      <Check className="h-3.5 w-3.5" />
      {t("cal_auto_synced")}
    </p>
  );
}
