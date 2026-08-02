import type { Booking } from "@/types";
import { coaches } from "@/lib/data";

/** Demo coach profile used when logged in as coach */
export function getDemoCoach() {
  return coaches[0];
}

export function bookingsForCoach(bookings: Booking[], coachId = getDemoCoach().id): Booking[] {
  return bookings
    .filter((b) => b.coachId === coachId)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}

export function pendingCoachBookings(bookings: Booking[], coachId = getDemoCoach().id): Booking[] {
  return bookingsForCoach(bookings, coachId).filter((b) => b.status === "pending");
}
