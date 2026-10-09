export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { canViewBreakdown, getBreakdownById } from "@/lib/server/athlete";
import { getRequestUser } from "@/lib/server/current-user";
import { BreakdownViewer } from "@/components/app/BreakdownViewer";

export default async function BreakdownPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, breakdown] = await Promise.all([getRequestUser(), getBreakdownById(id)]);
  if (!breakdown || !(await canViewBreakdown(user, breakdown))) notFound();
  return <BreakdownViewer breakdown={breakdown} />;
}
