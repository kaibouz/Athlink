import type { Booking } from "@/types";

export type CalendarAutoPref = "both" | "apple" | "google" | "off";

const PREF_KEY = "athlink_calendar_auto";

/** California launch default zone for demo events */
export const CALENDAR_TZ = "America/Los_Angeles";

export function getCalendarAutoPref(): CalendarAutoPref {
  if (typeof window === "undefined") return "both";
  try {
    const v = localStorage.getItem(PREF_KEY);
    if (v === "both" || v === "apple" || v === "google" || v === "off") return v;
  } catch {
    /* ignore */
  }
  return "both";
}

export function setCalendarAutoPref(pref: CalendarAutoPref) {
  try {
    localStorage.setItem(PREF_KEY, pref);
  } catch {
    /* ignore */
  }
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Local wall-clock → YYYYMMDDTHHmmss (no Z — device timezone / ICS TZID) */
function toLocalStamp(date: string, time: string): string {
  const [y, m, d] = date.split("-");
  const [hh, mm] = time.split(":");
  return `${y}${m}${d}T${pad(Number(hh))}${pad(Number(mm))}00`;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

export function bookingEventTitle(booking: Booking): string {
  return `AthLink · ${booking.coachName} × ${booking.athleteName}`;
}

export function bookingEventDescription(booking: Booking): string {
  const lines = [
    `AthLink lesson`,
    `Coach: ${booking.coachName}`,
    `Athlete: ${booking.athleteName}`,
    `Format: ${booking.format}`,
    `Plan: ${booking.packageType}`,
    `Price: $${booking.price}`,
  ];
  if (booking.note) lines.push(`Note: ${booking.note}`);
  lines.push(`Booking ID: ${booking.id}`);
  return lines.join("\n");
}

export function buildIcs(booking: Booking): string {
  const uid = `${booking.id}@athlink.app`;
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const start = toLocalStamp(booking.date, booking.startTime);
  const end = toLocalStamp(booking.date, booking.endTime);
  const summary = escapeIcs(bookingEventTitle(booking));
  const description = escapeIcs(bookingEventDescription(booking));
  const location = escapeIcs(
    booking.format === "online" ? "Online (AthLink)" : "In person · AthLink",
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AthLink//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${CALENDAR_TZ}:${start}`,
    `DTEND;TZID=${CALENDAR_TZ}:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** Google Calendar “Add event” deep link */
export function googleCalendarUrl(booking: Booking): string {
  const start = toLocalStamp(booking.date, booking.startTime);
  const end = toLocalStamp(booking.date, booking.endTime);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: bookingEventTitle(booking),
    dates: `${start}/${end}`,
    details: bookingEventDescription(booking),
    location: booking.format === "online" ? "Online (AthLink)" : "In person · AthLink",
    ctz: CALENDAR_TZ,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Download .ics — Apple Calendar / Outlook / Google import */
export function downloadAppleIcs(booking: Booking) {
  if (typeof window === "undefined") return;
  const blob = new Blob([buildIcs(booking)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `athlink-${booking.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function openGoogleCalendar(booking: Booking) {
  if (typeof window === "undefined") return;
  window.open(googleCalendarUrl(booking), "_blank", "noopener,noreferrer");
}

/**
 * Auto-register with Google and/or Apple (ICS) based on user preference.
 * Called when a booking is created or confirmed.
 */
export function autoSyncBookingToCalendars(booking: Booking) {
  if (typeof window === "undefined") return;
  if (booking.status === "cancelled" || booking.status === "completed") return;

  const pref = getCalendarAutoPref();
  if (pref === "off") return;

  if (pref === "both" || pref === "apple") {
    downloadAppleIcs(booking);
  }
  if (pref === "both" || pref === "google") {
    // slight delay so ICS download isn't blocked by popup timing
    window.setTimeout(() => openGoogleCalendar(booking), pref === "both" ? 400 : 0);
  }
}
