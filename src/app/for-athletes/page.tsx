import type { Metadata } from "next";
import { MarketingHomeLanding } from "@/components/landing/MarketingHomeLanding";

export const metadata: Metadata = {
  title: "AthlinkPro — The best baseball coach for every talent",
  description:
    "Find verified private baseball coaches, book lessons, message your coach, and train with purpose — all in one place.",
};

export default function ForAthletesPage() {
  return <MarketingHomeLanding />;
}
