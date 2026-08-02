import type { Booking } from "@/types";

/** Easy to tweak — “fill the cage” goals on the coach dashboard */
export const DASH_GOALS = {
  lessons: 150,
  revenueUsd: 12000,
  networkPlayers: 100,
} as const;

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
  あなた: "la",
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

/** Last N days of revenue (confirmed + completed + pending count as pipeline) */
export function revenueByDay(bookings: Booking[], days = 14): { date: string; amount: number }[] {
  const end = new Date("2026-07-29T12:00:00");
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, 0);
  }
  for (const b of activeBookings(bookings)) {
    if (!map.has(b.date)) continue;
    map.set(b.date, (map.get(b.date) ?? 0) + b.price);
  }
  // Smooth demo: distribute undated spill into nearby days if sparse
  const rows = [...map.entries()].map(([date, amount]) => ({ date, amount }));
  const sum = rows.reduce((s, r) => s + r.amount, 0);
  if (sum === 0) {
    return rows.map((r, i) => ({
      date: r.date,
      amount: Math.round(40 + Math.sin(i / 2) * 25 + i * 8),
    }));
  }
  return rows;
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
