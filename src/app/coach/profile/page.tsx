"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, Check, Plus, X } from "lucide-react";
import { CoachGate } from "@/components/coach/CoachGate";
import { useMyCoach } from "@/lib/use-my-coach";
import { useLocale } from "@/lib/i18n/provider";
import { languageLabel, specialtyLabel } from "@/lib/i18n/localize";
import { LANGUAGES, LOCATIONS, SPECIALTIES } from "@/lib/data";
import { LEVELS, POSITIONS, labelFor } from "@/lib/coach-taxonomy";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { CoachProfile, LessonFormat } from "@/types";

function Chips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition",
              on ? "border-accent bg-accent text-white" : "border-brand-200 bg-surface text-brand-700 hover:border-accent",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Form state seeded once from the loaded profile (keyed remount, no effect). */
function ProfileForm({ coach, welcome }: { coach: CoachProfile; welcome: boolean }) {
  const { t, locale } = useLocale();
  const [avatarUrl, setAvatarUrl] = useState(coach.avatarUrl);
  const [name, setName] = useState(coach.name);
  const [bio, setBio] = useState(coach.bio?.[locale as "en" | "ja" | "es"] ?? coach.bio?.en ?? "");
  const [experience, setExperience] = useState(String(coach.experienceYears ?? 0));
  const [price, setPrice] = useState(String(coach.pricePerHour));
  const [location, setLocation] = useState<string>(
    (LOCATIONS as readonly string[]).includes(coach.city) ? coach.city : LOCATIONS[0],
  );
  const [specialties, setSpecialties] = useState<string[]>(coach.specialties);
  const [positions, setPositions] = useState<string[]>(coach.positions ?? []);
  const [levels, setLevels] = useState<string[]>(coach.levels ?? []);
  const [languages, setLanguages] = useState<string[]>(coach.languages);
  const [formats, setFormats] = useState<string[]>(coach.formats);
  const [venues, setVenues] = useState<string[]>(coach.venues?.length ? coach.venues : [""]);
  const [video, setVideo] = useState(coach.introVideoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && data.url) setAvatarUrl(data.url);
    else setError(data.error === "STORAGE_NOT_CONFIGURED" ? t("cprof_storage_off") : t("cprof_photo_failed"));
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    setError("");
    const res = await fetch("/api/coaches/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatarUrl,
        name,
        bio,
        experienceYears: Number(experience),
        pricePerHour: Number(price),
        location,
        specialties,
        positions,
        levels,
        languages,
        formats,
        venues: venues.map((v) => v.trim()).filter(Boolean),
        introVideoUrl: video.trim() || null,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (res.ok) setStatus("saved");
    else {
      setStatus("error");
      setError(t("cprof_invalid", { field: (data.error ?? "").replace("INVALID_", "").toLowerCase() }));
    }
  }

  const inPerson = formats.includes("in_person");

  return (
    <form onSubmit={save} className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">{t("cprof_title")}</h1>
        <p className="mt-1 text-brand-600">{t("cprof_sub")}</p>
      </div>

      {welcome && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-brand-800">
          {t("cprof_welcome")}
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" className="h-20 w-20 rounded-2xl border border-brand-100 object-cover" />
        <label className="mx-btn mx-btn-ghost cursor-pointer text-[0.8rem]">
          <Camera className="h-4 w-4" />
          {uploading ? t("loading") : t("cprof_photo")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadPhoto(f);
            }}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">{t("register_name")}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="exp">{t("cprof_experience")}</Label>
          <Input id="exp" type="number" min={0} max={60} value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="price">{t("register_price")}</Label>
          <Input id="price" type="number" min={20} max={500} step={5} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="loc">{t("register_location")}</Label>
          <Select id="loc" value={location} onChange={(e) => setLocation(e.target.value)}>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="bio">{t("register_bio")}</Label>
          <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("register_bio_ph")} />
        </div>
      </div>

      <div>
        <Label>{t("register_specialty")}</Label>
        <Chips options={SPECIALTIES.map((s) => ({ id: s, label: specialtyLabel(t, s) }))} value={specialties} onChange={setSpecialties} />
      </div>
      <div>
        <Label>{t("cprof_positions")}</Label>
        <Chips options={POSITIONS.map((p) => ({ id: p.id, label: labelFor(POSITIONS, p.id, locale) }))} value={positions} onChange={setPositions} />
      </div>
      <div>
        <Label>{t("cprof_levels")}</Label>
        <Chips options={LEVELS.map((l) => ({ id: l.id, label: labelFor(LEVELS, l.id, locale) }))} value={levels} onChange={setLevels} />
      </div>
      <div>
        <Label>{t("register_languages")}</Label>
        <Chips options={LANGUAGES.map((l) => ({ id: l, label: languageLabel(t, l) }))} value={languages} onChange={setLanguages} />
      </div>
      <div>
        <Label>{t("booking_format")}</Label>
        <Chips
          options={(["in_person", "online"] as LessonFormat[]).map((f) => ({
            id: f,
            label: f === "in_person" ? t("search_in_person") : t("search_online"),
          }))}
          value={formats}
          onChange={setFormats}
        />
      </div>

      {inPerson && (
        <div>
          <Label>{t("cprof_venues")}</Label>
          <p className="mb-2 text-xs text-brand-500">{t("cprof_venues_hint")}</p>
          <div className="space-y-2">
            {venues.map((v, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={v}
                  placeholder={t("cprof_venue_ph")}
                  onChange={(e) => setVenues(venues.map((x, j) => (j === i ? e.target.value : x)))}
                />
                <button
                  type="button"
                  aria-label={t("bookings_cancel")}
                  onClick={() => setVenues(venues.length > 1 ? venues.filter((_, j) => j !== i) : [""])}
                  className="rounded-lg px-2 text-brand-500 hover:text-brand-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {venues.length < 6 && (
              <button type="button" onClick={() => setVenues([...venues, ""])} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                <Plus className="h-4 w-4" />
                {t("cprof_add_venue")}
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="video">{t("cprof_video")}</Label>
        <Input id="video" type="url" placeholder="https://youtube.com/…" value={video} onChange={(e) => setVideo(e.target.value)} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {status === "saved" ? <Check className="h-4 w-4" /> : null}
          {saving ? t("loading") : status === "saved" ? t("avail_saved") : t("cprof_save")}
        </Button>
        <Link href="/coach/calendar#availability" className="text-sm font-semibold text-accent hover:underline">
          {t("cprof_next_availability")}
        </Link>
        <Link href={`/coaches/${coach.id}`} className="text-sm text-brand-600 hover:underline">
          {t("cprof_view_public")}
        </Link>
      </div>
    </form>
  );
}

function ProfileInner() {
  const { coach, loading, hasProfile } = useMyCoach();
  const { t } = useLocale();
  const welcome = useSearchParams().get("welcome") === "1";
  if (loading) return <div className="px-4 py-16 text-center text-brand-500">{t("loading")}</div>;
  if (!hasProfile || !coach) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Link href="/coach/register">
          <Button>{t("nav_coach_register")}</Button>
        </Link>
      </div>
    );
  }
  return <ProfileForm key={coach.id} coach={coach} welcome={welcome} />;
}

export default function CoachProfilePage() {
  return (
    <CoachGate>
      <Suspense>
        <ProfileInner />
      </Suspense>
    </CoachGate>
  );
}
