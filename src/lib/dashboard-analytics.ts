import type { Booking, BookingStatus, StudentAthlete } from "@/types";

/** Easy to tweak — “fill the cage” goals on the coach dashboard */
export const DASH_GOALS = {
  lessons: 20,
  revenueUsd: 1000,
  networkPlayers: 10,
} as const;

export const REVENUE_PERIODS = [
  { days: "all" as const, key: "dash_rev_period_all" as const },
  { days: 30, key: "dash_rev_period_1m" as const },
  { days: 90, key: "dash_rev_period_3m" as const },
  { days: 180, key: "dash_rev_period_6m" as const },
  { days: 365, key: "dash_rev_period_1y" as const },
] as const;

export type RevenuePeriodDays = (typeof REVENUE_PERIODS)[number]["days"];

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type CaRegionId =
  | "la"
  | "oc"
  | "sd"
  | "bay"
  | "sac"
  | "ie"
  | "cv";

export const CA_REGIONS: {
  id: CaRegionId;
  label: string;
  /** Approximate label position on the stylized CA map */
  lx: number;
  ly: number;
}[] = [
  { id: "bay", label: "Bay Area", lx: 52, ly: 98 },
  { id: "sac", label: "Sacramento", lx: 95, ly: 78 },
  { id: "cv", label: "Central Valley", lx: 110, ly: 165 },
  { id: "ie", label: "Inland Empire", lx: 155, ly: 248 },
  { id: "la", label: "Los Angeles", lx: 118, ly: 255 },
  { id: "oc", label: "Orange County", lx: 148, ly: 278 },
  { id: "sd", label: "San Diego", lx: 145, ly: 318 },
];

/** Demo mapping: athlete names → CA metro (for choropleth) */
const ATHLETE_REGION: Record<string, CaRegionId> = {
  "Ethan Park": "la",
  "Sofia Reyes": "oc",
  "Kenji Nakamura": "sd",
  "Maya Chen": "bay",
  "Liam Ortiz": "ie",
  "Demo Athlete": "la",
  you: "la",
};

export function regionForAthlete(name: string): CaRegionId {
  return ATHLETE_REGION[name] ?? "la";
}

export function activeBookings(bookings: Booking[]) {
  return bookings.filter((b) => b.status !== "cancelled");
}

export function completedCount(bookings: Booking[]) {
  return bookings.filter((b) => b.status === "completed").length;
}

export function revenueTotal(bookings: Booking[]) {
  return activeBookings(bookings).reduce((s, b) => s + b.price, 0);
}

export function uniqueAthleteCount(bookings: Booking[]) {
  return new Set(activeBookings(bookings).map((b) => b.athleteName)).size;
}

export type LessonHistoryRow = {
  id: string;
  sortKey: string;
  date: string;
  athleteName: string;
  status: BookingStatus;
  price?: number;
  note?: string;
  startTime?: string;
  endTime?: string;
  durationMin?: number;
  focus?: string;
};

/** Unified lesson list — bookings plus roster logs, deduped by id. */
export function lessonHistoryRows(
  bookings: Booking[],
  roster: StudentAthlete[],
): LessonHistoryRow[] {
  const fromBookings = activeBookings(bookings).map((b) => ({
    id: b.id,
    sortKey: `${b.date}T${b.startTime}`,
    date: b.date,
    athleteName: b.athleteName,
    status: b.status,
    price: b.price,
    note: b.note,
    startTime: b.startTime,
    endTime: b.endTime,
  }));

  const fromLogs = roster.flatMap((s) =>
    s.lessonLog.map((l) => ({
      id: l.id,
      sortKey: `${l.date}T12:00`,
      date: l.date,
      athleteName: s.name,
      status: "completed" as BookingStatus,
      note: l.notes,
      durationMin: l.durationMin,
      focus: l.focus,
    })),
  );

  const seen = new Set<string>();
  return [...fromBookings, ...fromLogs]
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    })
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export function lessonHistoryCount(bookings: Booking[], roster: StudentAthlete[]) {
  return lessonHistoryRows(bookings, roster).length;
}

/** @deprecated Use lessonHistoryCount — kept for callers migrating to unified rows. */
export function lessonProgressCount(bookings: Booking[]) {
  return activeBookings(bookings).length;
}

/** Latest booking date — series end so the cage and chart share the same totals. */
export function revenueAnchorEnd(bookings: Booking[]): Date {
  const dates = activeBookings(bookings).map((b) => b.date);
  if (dates.length === 0) return new Date();
  const max = dates.reduce((a, b) => (a > b ? a : b));
  return new Date(`${max}T00:00:00`);
}

/** Daily revenue for the last N days ending at the latest booking. */
export function revenueByDay(bookings: Booking[], days = 14): { date: string; amount: number }[] {
  const series = revenueSeries(bookings, days <= 31 ? 30 : 90);
  return series.map((s) => ({ date: s.key, amount: s.amount }));
}

/** Revenue series from real bookings — no synthetic fill. "all" = lifetime (same as the cage). */
export function revenueSeries(
  bookings: Booking[],
  periodDays: RevenuePeriodDays,
): { key: string; amount: number; label: string }[] {
  const active = activeBookings(bookings);
  const byDate = new Map<string, number>();
  for (const b of active) {
    byDate.set(b.date, (byDate.get(b.date) ?? 0) + b.price);
  }

  const end = revenueAnchorEnd(bookings);
  let start: Date;
  if (periodDays === "all" || active.length === 0) {
    const min = active.length
      ? active.map((b) => b.date).reduce((a, b) => (a < b ? a : b))
      : dateKey(end);
    start = new Date(`${min}T00:00:00`);
  } else {
    start = new Date(end);
    start.setDate(end.getDate() - (periodDays - 1));
  }

  const spanDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1,
  );
  const bucketDays = spanDays <= 45 ? 1 : spanDays <= 120 ? 7 : 14;
  const buckets = new Map<string, number>();

  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const daysFromStart = Math.round((cursor.getTime() - start.getTime()) / 86_400_000);
    const aligned = bucketDays === 1 ? daysFromStart : daysFromStart - (daysFromStart % bucketDays);
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() + aligned);
    const key = dateKey(bucketStart);
    if (!buckets.has(key)) buckets.set(key, 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const [date, amount] of byDate) {
    const d = new Date(`${date}T00:00:00`);
    if (d < start || d > end) continue;
    const daysFromStart = Math.round((d.getTime() - start.getTime()) / 86_400_000);
    const aligned = bucketDays === 1 ? daysFromStart : daysFromStart - (daysFromStart % bucketDays);
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() + aligned);
    const key = dateKey(bucketStart);
    buckets.set(key, (buckets.get(key) ?? 0) + amount);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({ key, amount, label: key.slice(5) }));
}

export function regionLessonCounts(bookings: Booking[]): Record<CaRegionId, number> {
  const counts: Record<CaRegionId, number> = {
    la: 0,
    oc: 0,
    sd: 0,
    bay: 0,
    sac: 0,
    ie: 0,
    cv: 0,
  };
  for (const b of activeBookings(bookings)) {
    const r = regionForAthlete(b.athleteName);
    counts[r] += 1;
  }
  // Ensure choropleth has visible variation in demo
  if (Object.values(counts).every((v) => v === 0)) {
    return { la: 8, oc: 5, sd: 3, bay: 4, sac: 1, ie: 2, cv: 1 };
  }
  return counts;
}

export function choroplethColor(value: number, max: number): string {
  if (max <= 0 || value <= 0) return "#e2e8f0";
  const t = Math.min(1, value / max);
  // light sky → deep brand blue
  const stops = [
    [219, 234, 254],
    [147, 197, 253],
    [59, 130, 246],
    [29, 78, 216],
    [30, 58, 138],
  ];
  const idx = t * (stops.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}
