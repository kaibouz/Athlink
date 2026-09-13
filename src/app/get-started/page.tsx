import type { Metadata } from "next";
import { JoinGateway } from "@/components/join/JoinGateway";

export const metadata: Metadata = {
  title: "Which one are you? — AthlinkPro",
  description: "Choose athlete or coach — the same Get Started fork as the AthlinkPro app.",
};

/** PDF: Choose your side — single role fork after HQ Get Started. */
export default function GetStartedPage() {
  return <JoinGateway />;
}
