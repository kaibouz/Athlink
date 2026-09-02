import { redirect } from "next/navigation";

/** Legacy URL — gateway moved to /join */
export default function OnboardingRedirectPage() {
  redirect("/join");
}
