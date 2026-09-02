import type { Metadata } from "next";
import { AthleteHomeLanding } from "@/components/athlete/AthleteHomeLanding";

export const metadata: Metadata = {
  title: "AthlinkPro for Athletes — Train With Purpose",
  description:
    "Book verified private coaches, message them directly, share your progress on a training feed built for athletes, and get AI biomechanical breakdowns — all in one place.",
};

export default function ForAthletesPage() {
  return <AthleteHomeLanding />;
}
