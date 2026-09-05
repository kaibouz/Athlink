"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CoachProfile, LessonFormat, PackageType, TimeSlot } from "@/types";
import { getSlotsByCoach } from "@/lib/data";
import { useAuth } from "@/lib/store";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { autoSyncBookingToCalendars } from "@/lib/calendar";
import { trackEvent } from "@/lib/track-event";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Input";
import {
  AddToCalendarButtons,
  CalendarAutoPrefSelect,
  CalendarSyncedNote,
} from "@/components/calendar/AddToCalendar";
import type { Booking } from "@/types";

const SESSION_TYPES = ["Assessment", "Hitting", "Pitching", "Fielding", "Strength"] as const;

export function BookingForm({ coach }: { coach: CoachProfile }) {
  const router = useRouter();
  const { user, addBooking } = useAuth();
  const { t, locale } = useLocale();
  const isCoachPublishing = user?.role === "coach";
  const [slots, setSlots] = useState<TimeSlot[]>(() => getSlotsByCoach(coach.id));
  const dates = useMemo(() => [...new Set(slots.map((s) => s.date))], [slots]);
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [format, setFormat] = useState<LessonFormat>(coach.formats[0]);
  const [packageType, setPackageType] = useState<PackageType>("single");
  const [sessionType, setSessionType] = useState<string>(SESSION_TYPES[1]);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Booking | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/coaches/${coach.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { slots?: TimeSlot[] } | null) => {
        if (cancelled || !data?.slots?.length) return;
        setSlots(data.slots);
      })
      .catch(() => {
        /* keep static fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [coach.id]);

  useEffect(() => {
    if (dates.length === 0) return;
    if (!date || !dates.includes(date)) {
      setDate(dates[0]);
      setSlotId("");
    }
  }, [dates, date]);

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

  function openConfirm(e: React.FormEvent) {
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
    setConfirmOpen(true);
  }

  async function confirmBooking() {
    if (!user || !selected) return;
    trackEvent("booking_start", { coachId: coach.id }, coach.id);
    const composedNote = [sessionType, note].filter(Boolean).join(" — ");
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
      note: composedNote || undefined,
    });
    setCreated(booking);
    autoSyncBookingToCalendars(booking);
    setConfirmOpen(false);
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
      onSubmit={openConfirm}
      className="space-y-4 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm"
    >
      <h3 className="text-lg font-bold text-brand-950">
        {t(isCoachPublishing ? "booking_title_publish" : "booking_title")}
      </h3>

      {/* Week-strip date picker (slot-first ordering) */}
      <div>
        <Label>{t("booking_date")}</Label>
        <div className="-mx-1 mt-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {dates.map((d) => {
            const dObj = new Date(`${d}T00:00:00`);
            const wd = dObj.toLocaleDateString(dateLocale, { weekday: "short" });
            const dayNum = dObj.getDate();
            const on = date === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDate(d);
                  setSlotId("");
                }}
                className={`flex min-w-[3.25rem] flex-col items-center rounded-xl border px-2 py-2 text-center transition ${
                  on
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 bg-surface text-brand-700 hover:border-brand-400"
                }`}
              >
                <span className="text-[11px] font-medium uppercase opacity-80">{wd}</span>
                <span className="text-lg font-black leading-tight">{dayNum}</span>
              </button>
            );
          })}
        </div>
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

      {/* Session-type picker */}
      <div>
        <Label>Session type</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {SESSION_TYPES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSessionType(st)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                sessionType === st
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 bg-surface text-brand-700 hover:border-brand-400"
              }`}
            >
              {st}
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

      {confirmOpen && selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="mx-app w-full max-w-md rounded-t-2xl border border-[color:var(--mx-border-strong)] bg-[color:var(--mx-panel)] p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color:var(--mx-border-strong)] sm:hidden" />
            <h4 className="text-base font-bold text-[color:var(--mx-text)]">Confirm booking</h4>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[color:var(--mx-dim)]">Coach</span>
                <span className="font-semibold text-[color:var(--mx-text)]">{coach.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[color:var(--mx-dim)]">When</span>
                <span className="font-semibold text-[color:var(--mx-text)]">
                  {formatDateJa(selected.date, dateLocale)} · {selected.startTime}–{selected.endTime}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[color:var(--mx-dim)]">Session</span>
                <span className="font-semibold text-[color:var(--mx-text)]">
                  {sessionType} · {format === "online" ? t("search_online") : t("search_in_person")}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[color:var(--mx-dim)]">Total</span>
                <span className="text-lg font-black text-[color:var(--mx-text)]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-[color:var(--mx-panel-2)] px-3 py-2 text-[11px] leading-snug text-[color:var(--mx-dimmer)]">
              Cancel policy: free cancellation up to 24h before. Within 24h, a 50% fee applies.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="mx-btn mx-btn-ghost flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={confirmBooking}
                className="mx-btn mx-btn-accent flex-1 border-0"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
