"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { LANGUAGES, LOCATIONS, SPECIALTIES, SPORTS } from "@/lib/data";
import { useAuth } from "@/lib/store";
import { useMyCoach } from "@/lib/use-my-coach";
import { trackEvent } from "@/lib/track-event";
import { useLocale } from "@/lib/i18n/provider";
import { languageLabel, specialtyLabel, sportLabel } from "@/lib/i18n/localize";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";

export default function CoachRegisterPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const { coach, hasProfile, loading: coachLoading } = useMyCoach();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("baseball");
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES[0]);
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [languages, setLanguages] = useState<string[]>(["english"]);
  const [price, setPrice] = useState("80");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/signup?role=coach&next=/coach/register");
      return;
    }
    if (user.role !== "coach") {
      router.replace("/me");
    }
  }, [user, hydrated, router]);

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user, name]);

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (languages.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          sport,
          specialty,
          location,
          languages,
          pricePerHour: Number(price),
          bio,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "REGISTER_FAILED");
        return;
      }

      const data = (await res.json()) as { coach: { id: string } };
      trackEvent("coach_register_complete", { coachId: data.coach.id });
      setSubmitted(true);
      setTimeout(() => router.push(`/coaches/${data.coach.id}`), 1500);
    } catch {
      setError("REGISTER_FAILED");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated || coachLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-brand-500">{t("loading")}</div>
    );
  }

  if (hasProfile && coach && !submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("register_already_title")}</h1>
        <p className="mt-2 text-brand-600">{t("register_already_body")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/coaches/${coach.id}`}>
            <Button>{t("me_view_public")}</Button>
          </Link>
          <Link href="/coach/dashboard">
            <Button variant="outline">{t("register_dashboard")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-brand-950">{t("register_done_title")}</h1>
        <p className="mt-2 text-brand-600">{t("register_done_live", { name })}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-950">{t("register_title")}</h1>
        <p className="mt-2 text-brand-600">{t("register_sub_live")}</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-brand-100 bg-surface p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">{t("register_name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Shota Tanaka"
            />
          </div>
          <div>
            <Label htmlFor="sport">{t("register_sport")}</Label>
            <Select id="sport" value={sport} onChange={(e) => setSport(e.target.value)}>
              {SPORTS.map((s) => (
                <option key={s} value={s}>
                  {sportLabel(t, s)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="specialty">{t("register_specialty")}</Label>
            <Select
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {specialtyLabel(t, s)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="location">{t("register_location")}</Label>
            <Select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="price">{t("register_price")}</Label>
            <Input
              id="price"
              type="number"
              min={40}
              max={300}
              step={5}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label>{t("register_languages")}</Label>
            <p className="mb-2 text-xs text-brand-500">{t("register_languages_hint")}</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const selected = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      selected
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-brand-200 bg-surface text-brand-700 hover:border-brand-400"
                    }`}
                  >
                    {languageLabel(t, lang)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="bio">{t("register_bio")}</Label>
            <Textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("register_bio_ph")}
              required
            />
          </div>
        </div>
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {t("register_note_live")}
        </div>
        {error && <p className="text-center text-sm text-red-600">{t("register_error")}</p>}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={languages.length === 0 || submitting}
        >
          {submitting ? t("loading") : t("register_submit")}
        </Button>
      </form>
    </div>
  );
}
