import { clsx, type ClassValue } from "clsx";
import type { BookingStatus, LessonFormat, PackageType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** California launch: prices are stored and displayed in USD. */
export function formatPrice(amountUsd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amountUsd);
}

export function formatLabel(format: LessonFormat): string {
  return format === "in_person" ? "In person" : "Online";
}

export function packageLabel(type: PackageType): string {
  switch (type) {
    case "single":
      return "Single";
    case "pack":
      return "5-pack";
    case "subscription":
      return "Monthly subscription";
  }
}

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "declined":
      return "Declined";
  }
}

export function formatDateJa(dateStr: string, locale = "en-US"): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(d);
}

const dateLocaleOf = (locale: string) => (locale.startsWith("ja") ? "ja-JP" : locale.startsWith("es") ? "es-US" : "en-US");

/**
 * "16:00" → "4:00 PM" for English/Spanish (what US families expect, and what
 * the app shows); Japanese keeps the 24-hour clock.
 */
export function formatTime(hhmm: string, locale = "en"): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  if (locale.startsWith("ja")) return `${h}:${String(m).padStart(2, "0")}`;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "16:00","17:00" → "4:00–5:00 PM" (same half-day) / "11:00 AM–12:00 PM". */
export function formatTimeRange(start: string, end: string, locale = "en"): string {
  if (locale.startsWith("ja")) return `${formatTime(start, locale)}–${formatTime(end, locale)}`;
  const a = formatTime(start, locale);
  const b = formatTime(end, locale);
  const [aTime, aSuf] = a.split(" ");
  return aSuf === b.split(" ")[1] ? `${aTime}–${b}` : `${a}–${b}`;
}

/** Compact day label: "Mon, Oct 26" / "10月26日(月)". */
export function formatDateShort(dateStr: string, locale = "en"): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat(dateLocaleOf(locale), { weekday: "short", month: "short", day: "numeric" }).format(d);
}
