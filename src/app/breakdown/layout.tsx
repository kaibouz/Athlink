import { notFound } from "next/navigation";
import { AI_BREAKDOWN_ENABLED } from "@/lib/features";

/** AI breakdown is switched off for the MVP — its pages simply don't exist. */
export default function BreakdownLayout({ children }: { children: React.ReactNode }) {
  if (!AI_BREAKDOWN_ENABLED) notFound();
  return children;
}
