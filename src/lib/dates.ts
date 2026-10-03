/**
 * Calendar dates in the business's time zone.
 *
 * Booking dates are stored as plain `YYYY-MM-DD` California calendar days.
 * `new Date().toISOString().slice(0, 10)` is the UTC day, which in California
 * rolls over to tomorrow at 5pm (4pm in winter) — right when evening lessons
 * happen — so "today" screens would jump a day early. Everything that asks
 * "what day is it" goes through here instead, on server and client alike.
 */
export const APP_TIME_ZONE = "America/Los_Angeles";

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** `YYYY-MM-DD` for the given instant, as a California calendar day. */
export function dateKey(date: Date = new Date()): string {
  return keyFormatter.format(date);
}

/** Today's California calendar day. */
export function todayKey(): string {
  return dateKey(new Date());
}

/** `YYYY-MM` for the current California month. */
export function monthKey(date: Date = new Date()): string {
  return dateKey(date).slice(0, 7);
}

/** Shift a `YYYY-MM-DD` key by whole days (calendar arithmetic, no DST drift). */
export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + days);
  return new Date(utc).toISOString().slice(0, 10);
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** `HH:MM` wall-clock time in California right now. */
export function nowTimeKey(date: Date = new Date()): string {
  return timeFormatter.format(date);
}

/** True while a session on `date` ending at `endTime` hasn't finished yet. */
export function isNotOver(date: string, endTime: string): boolean {
  const today = todayKey();
  return date > today || (date === today && endTime > nowTimeKey());
}
