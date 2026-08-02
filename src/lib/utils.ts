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
  return format === "in_person" ? "対面" : "オンライン";
}

export function packageLabel(type: PackageType): string {
  switch (type) {
    case "single":
      return "単発";
    case "pack":
      return "パック（5回）";
    case "subscription":
      return "月額サブスク";
  }
}

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "確認待ち";
    case "confirmed":
      return "予約確定";
    case "completed":
      return "完了";
    case "cancelled":
      return "キャンセル";
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
