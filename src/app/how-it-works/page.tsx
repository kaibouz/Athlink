import type { Metadata } from "next";
import { HowItWorksPage } from "@/components/landing/HowItWorksPage";

export const metadata: Metadata = {
  title: "How AthlinkPro works — book, message, share, and get your AI breakdown",
  description:
    "Find and book a verified private coach, message them directly, post to your training feed, and get an automatic biomechanical breakdown after every session.",
};

export default function HowItWorksRoute() {
  return <HowItWorksPage />;
}
