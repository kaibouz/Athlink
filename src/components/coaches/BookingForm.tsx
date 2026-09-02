"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CoachProfile, LessonFormat, PackageType, TimeSlot } from "@/types";
import { getSlotsByCoach } from "@/lib/data";
import { useAuth } from "@/lib/store";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { autoSyncBookingToCalendars } from "@/lib/calendar";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Input";
import {
  AddToCalendarButtons,
  CalendarAutoPrefSelect,
  CalendarSyncedNote,
} from "@/components/calendar/AddToCalendar";
import type { Booking } from "@/types";

export function BookingForm({ coach }: { coach: CoachProfile }) {
  const router = useRouter();
  const { user, addBooking } = useAuth();
  const { t, locale } = useLocale();
  const isCoachPublishing = user?.role === "coach";
  const slots = useMemo(() => getSlotsByCoach(coach.id), [coach.id]);
  const dates = useMemo(() => [...new Set(slots.map((s) => s.date))], [slots]);

  const [date, setDate] = useState(dates[0] ?? "");
  const [slotId, setSlotId] = useState("");
  const [format, setFormat] = useState<LessonFormat>(coach.formats[0]);
  const [packageType, setPackageType] = useState<PackageType>("single");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Booking | null>(null);

  const daySlots = slots.filter((s) => s.date === date);
  const priceMultiplier =
    packageType === "pack" ? 5 * 0.9 : packageType === "subscription" ? 4 * 0.85 : 1;
  const suggestedTotal = Math.round(coach.pricePerHour * priceMultiplier);
  const [priceInput, setPriceInput] = useState(String(suggestedTotal));
  const selected: TimeSlot | undefined = daySlots.find((s) => s.id === slotId);

  useEffect(() => {
    setPriceInput(String(suggestedTotal));
  }, [suggestedTotal]);

  const total = useMemo(() => {
    const n = Number(priceInput);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  }, [priceInput]);

  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) {
      router.push(`/login?next=/c/${coach.id}`);
      return;
    }
    if (!selected) {
      setError(t("booking_pick_slot"));
      return;
    }
    if (total <= 0) {
      setError(t("booking_total_invalid"));
      return;
    }
    const booking = await addBooking({
      coachId: coach.id,
      coachName: coach.name,
      athleteId: user.id,
      athleteName: user.name,
      date: selected.date,
      startTime: selected.startTime,
      endTime: selected.endTime,
      format,
      packageType,
      price: total,
      note: note || undefined,
    });
    setCreated(booking);
    autoSyncBookingToCalendars(booking);
    setDone(true);
  }

  if (done && selected) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
          {t(isCoachPublishing ? "booking_done_publish" : "booking_done")}
        </p>
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200">
          {formatDateJa(selected.date, dateLocale)} {selected.startTime}–{selected.endTime}
        </p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">{formatPrice(total)}</p>
        <CalendarSyncedNote />
        {created && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-brand-600">{t("cal_add_manual")}</p>
            <AddToCalendarButtons booking={created} />
          </div>
        )}
        <div className="mt-5">
          <CalendarAutoPrefSelect />
        </div>
        <Button className="mt-4" onClick={() => router.push(isCoachPublishing ? "/coach/dashboard" : "/bookings")}>
          {t(isCoachPublishing ? "booking_view_publish" : "booking_view")}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm"
    >
      <h3 className="text-lg font-bold text-brand-950">
        {t(isCoachPublishing ? "booking_title_publish" : "booking_title")}
      </h3>
      <div>
        <Label htmlFor="date">{t("booking_date")}</Label>
        <Select
          id="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSlotId("");
          }}
        >
          {dates.map((d) => (
            <option key={d} value={d}>
              {formatDateJa(d, dateLocale)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>{t("booking_slots")}</Label>
        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {daySlots.length === 0 && (
            <p className="col-span-full text-sm text-brand-500">{t("booking_no_slots")}</p>
          )}
          {daySlots.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSlotId(s.id)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                slotId === s.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 bg-surface text-brand-800 hover:border-brand-400"
              }`}
            >
              {s.startTime}–{s.endTime}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="format">{t("booking_format")}</Label>
        <Select
          id="format"
          value={format}
          onChange={(e) => setFormat(e.target.value as LessonFormat)}
        >
          {coach.formats.map((f) => (
            <option key={f} value={f}>
              {f === "in_person" ? t("search_in_person") : t("search_online")}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="pkg">{t("booking_plan")}</Label>
        <Select
          id="pkg"
          value={packageType}
          onChange={(e) => setPackageType(e.target.value as PackageType)}
        >
          <option value="single">{t("package_single")}</option>
          <option value="pack">{t("package_pack_off")}</option>
          <option value="subscription">{t("package_sub_off")}</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="note">{t("booking_note")}</Label>
        <Textarea
          id="note"
          rows={3}
          placeholder={t("booking_note_ph")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="rounded-xl bg-brand-50 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="total" className="mb-0 shrink-0 text-sm">
            {t("booking_total")}
          </Label>
          <div className="inline-flex h-9 items-center gap-0.5 rounded-lg border border-brand-200 bg-surface px-2">
            <span className="text-base font-bold text-brand-500">$</span>
            <input
              id="total"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              aria-label={t("booking_total")}
              className="h-8 w-[4.5rem] border-0 bg-transparent p-0 text-right text-xl font-black tabular-nums text-brand-950 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-brand-500">{t("booking_total_hint")}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" size="lg">
        {user
          ? t(isCoachPublishing ? "booking_submit_publish" : "booking_submit")
          : t("booking_login")}
      </Button>
      <p className="text-center text-xs text-brand-400">
        {t(isCoachPublishing ? "booking_demo_note_publish" : "booking_demo_note")}
      </p>
    </form>
  );
}
