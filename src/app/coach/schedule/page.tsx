import { redirect } from "next/navigation";

/** Alias — mobile concept "Calendar" tab uses /coach/calendar */
export default function CoachScheduleRedirect() {
  redirect("/coach/calendar");
}
