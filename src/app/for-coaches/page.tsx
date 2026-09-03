import type { Metadata } from "next";
import { CoachHomeLanding } from "@/components/coach/CoachHomeLanding";

export const metadata: Metadata = {
  title: "AthlinkPro for Coaches — Run Your Coaching Business",
  description:
    "The operating system for private baseball coaches — scheduling, client management, and growth tools without payment setup in MVP.",
};

export default function ForCoachesPage() {
  return <CoachHomeLanding />;
}
