"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { useSocial } from "@/lib/social-store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export default function EditAthleteProfilePage() {
  const { t } = useLocale();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { profiles, updateProfile } = useSocial();
  const router = useRouter();
  const athlete = useMemo(
    () => profiles.find((p) => p.id === params.id),
    [profiles, params.id],
  );

  const [school, setSchool] = useState(athlete?.school ?? "");
  const [classYear, setClassYear] = useState(athlete?.classYear ?? "");
  const [height, setHeight] = useState(athlete?.height ?? "");
  const [weight, setWeight] = useState(athlete?.weight ?? "");
  const [position, setPosition] = useState(athlete?.position ?? "");
  const [batsThrows, setBatsThrows] = useState(athlete?.batsThrows ?? "");
  const [email, setEmail] = useState(athlete?.email ?? "");
  const [bio, setBio] = useState(athlete?.bio ?? "");
  const [avg, setAvg] = useState(athlete?.seasonStats.avg ?? "");
  const [era, setEra] = useState(athlete?.seasonStats.era ?? "");
  const [saved, setSaved] = useState(false);

  if (!athlete) {
    return (
      <div className="p-8 text-center text-brand-600">{t("social_athlete_missing")}</div>
    );
  }

  if (user && user.id !== athlete.userId && user.role !== "coach") {
    // allow demo athlete u-athlete-1 to edit a1
  }

  const canEdit = !user || user.id === athlete.userId || athlete.userId === "u-athlete-1";

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-brand-700">{t("social_edit_forbidden")}</p>
        <Link href={`/athletes/${athlete.id}`} className="mt-4 inline-block">
          <Button variant="outline">{t("social_view_profile")}</Button>
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!athlete) return;
    updateProfile(athlete.id, {
      school,
      classYear,
      height,
      weight,
      position,
      batsThrows,
      email,
      bio,
      seasonStats: {
        ...athlete.seasonStats,
        avg: avg || undefined,
        era: era || undefined,
      },
    });
    setSaved(true);
    setTimeout(() => router.push(`/athletes/${athlete.id}`), 600);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">{t("social_edit_profile")}</h1>
      <p className="mt-1 text-brand-600">{t("social_edit_sub")}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="school">{t("social_field_school")}</Label>
            <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="year">{t("social_field_class")}</Label>
            <Input id="year" value={classYear} onChange={(e) => setClassYear(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pos">{t("social_field_position")}</Label>
            <Input id="pos" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ht">{t("social_field_height")}</Label>
            <Input id="ht" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="wt">{t("social_field_weight")}</Label>
            <Input id="wt" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="bt">Bats / Throws</Label>
            <Input id="bt" value={batsThrows} onChange={(e) => setBatsThrows(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="avg">AVG (optional)</Label>
            <Input id="avg" value={avg} onChange={(e) => setAvg(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="era">ERA (optional)</Label>
            <Input id="era" value={era} onChange={(e) => setEra(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="bio">{t("social_field_bio")}</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg">
          {saved ? t("social_saved") : t("social_save_profile")}
        </Button>
      </form>
    </div>
  );
}
