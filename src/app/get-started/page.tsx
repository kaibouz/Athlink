import type { Metadata } from "next";
import { JoinGateway } from "@/components/join/JoinGateway";

export const metadata: Metadata = {
  title: "Get started — AthlinkPro",
  description: "Choose athlete or coach to continue to AthlinkPro.",
};

/** Role fork — after brand HQ. Not the site homepage. */
export default function GetStartedPage() {
  return <JoinGateway />;
}
