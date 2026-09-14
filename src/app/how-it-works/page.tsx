import { redirect } from "next/navigation";

/**
 * Legacy URL — athlete/coach How it works details live on role LPs only.
 * Avoid a third duplicated marketing page.
 */
export default function HowItWorksRedirectPage() {
  redirect("/for-athletes");
}
