export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getBreakdownById } from "@/lib/server/athlete";
import { BreakdownViewer } from "@/components/app/BreakdownViewer";

export default async function BreakdownPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const breakdown = await getBreakdownById(id);
  if (!breakdown) notFound();
  return <BreakdownViewer breakdown={breakdown} />;
}
