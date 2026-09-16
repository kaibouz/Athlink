import { redirect } from "next/navigation";

/**
 * Legacy URL — detailed How it works lives on market HQ (`/#how-it-works`).
 * Role LPs keep their own audience sections; avoid a third full marketing page.
 */
export default function HowItWorksRedirectPage() {
  redirect("/");
}
