import { notFound } from "next/navigation";
import { coaches, getCoachById, getReviewsByCoach } from "@/lib/data";
import { CoachDetailView } from "@/components/coaches/CoachDetailView";

export function generateStaticParams() {
  return coaches.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coach = getCoachById(id);
  if (!coach) return { title: "Coach" };
  return {
    title: `${coach.name} — ${coach.sport}`,
    description: coach.bio.en,
  };
}

export default async function CoachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coach = getCoachById(id);
  if (!coach) notFound();
  return <CoachDetailView coach={coach} reviews={getReviewsByCoach(coach.id)} />;
}
