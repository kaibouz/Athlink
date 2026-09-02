import { notFound } from "next/navigation";
import { listCoaches, getCoachById, getReviewsByCoach } from "@/lib/server/data";
import { CoachDetailView } from "@/components/coaches/CoachDetailView";

export async function generateStaticParams() {
  const coaches = await listCoaches();
  return coaches.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coach = await getCoachById(id);
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
  const coach = await getCoachById(id);
  if (!coach) notFound();
  const reviews = await getReviewsByCoach(coach.id);
  return <CoachDetailView coach={coach} reviews={reviews} />;
}
