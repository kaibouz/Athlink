"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  Copy,
  Handshake,
  Share2,
  UserRound,
  Users,
} from "lucide-react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { LANGUAGES, LOCATIONS, SPECIALTIES, SPORTS } from "@/lib/data";
import { useLocale } from "@/lib/i18n/provider";
import { languageLabel, specialtyLabel, sportLabel } from "@/lib/i18n/localize";
import {
  clearDraft,
  defaultDraft,
  destinationFor,
  joinPathFor,
  loadDraft,
  markOnboardingComplete,
  ONBOARDING_WIZARD_STEPS,
  saveDraft,
  setOnboardingPending,
  type OnboardingDraft,
  type OnboardingStep,
} from "@/lib/onboarding";
import { useSocial } from "@/lib/social-store";
import { useAuth } from "@/lib/store";
import { trackEvent } from "@/lib/track-event";
import { cn } from "@/lib/utils";
import type { SocialPostType } from "@/types";

const DEMO_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

function stepBefore(step: OnboardingStep): OnboardingStep | null {
  const idx = ONBOARDING_WIZARD_STEPS.indexOf(step as (typeof ONBOARDING_WIZARD_STEPS)[number]);
  if (idx <= 0) return null;
  return ONBOARDING_WIZARD_STEPS[idx - 1] ?? null;
}

export function OnboardingClient({ role }: { role: "coach" | "athlete" }) {
  const router = useRouter();
  const { t } = useLocale();
  const { user, hydrated, signup } = useAuth();
  const { createProfile, addPost } = useSocial();
  const primaryBtnClass =
    role === "athlete" ? "btn-athlete-primary border-0" : "btn-landing-primary border-0";

  const [step, setStep] = useState<OnboardingStep>("account");
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const saved = loadDraft();
    if (saved?.role === role) return saved;
    return defaultDraft(role);
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const athleteProfileIdRef = useRef<string | null>(null);

  const patchDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    setOnboardingPending();
    patchDraft({ role });
    trackEvent("onboarding_start", { role });
  }, [role, patchDraft]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    if (!hydrated || !user) return;
    if (user.role !== role && user.role !== "parent") {
      router.replace(joinPathFor(user.role === "coach" ? "coach" : "athlete"));
      return;
    }
    patchDraft({
      name: draft.name || user.name,
      email: draft.email || user.email,
      role,
    });
  }, [hydrated, user, patchDraft, draft.name, draft.email, role, router]);

  const bookUrl = useMemo(() => {
    if (!coachId) return "";
    if (typeof window === "undefined") return `/c/${coachId}`;
    return `${window.location.origin}/c/${coachId}`;
  }, [coachId]);

  const qrSrc = bookUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(bookUrl)}`
    : "";

  function goBack() {
    setError("");
    if (step === "account") {
      router.push("/join");
      return;
    }
    const prev = stepBefore(step);
    if (prev && prev !== "welcome") setStep(prev);
  }

  async function saveCoachProfile(): Promise<boolean> {
    const name = (user?.name || draft.name).trim();
    if (!name || !draft.sport || !draft.specialty || !draft.location || !draft.bio.trim()) {
      setError(t("onboard_error_required"));
      return false;
    }
    if (draft.languages.length === 0) {
      setError(t("register_languages_error"));
      return false;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          sport: draft.sport,
          specialty: draft.specialty,
          location: draft.location,
          languages: draft.languages,
          pricePerHour: Number(draft.price) || 80,
          bio: draft.bio.trim(),
        }),
      });

      if (!res.ok) {
        setError(t("onboard_error_save"));
        return false;
      }

      const data = (await res.json()) as { coach: { id: string } };
      setCoachId(data.coach.id);
      trackEvent("coach_register_complete", { coachId: data.coach.id });
      return true;
    } catch {
      setError(t("onboard_error_save"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Persist athlete profile: Postgres via /api/athletes/me when DB is up;
   * fall back to localStorage demo store only on 503 / offline demo.
   */
  async function ensureAthleteProfile(): Promise<string | null> {
    if (athleteProfileIdRef.current || !user) return athleteProfileIdRef.current;
    const payload = {
      name: user.name || draft.name,
      school: draft.school.trim(),
      classYear: draft.classYear,
      height: draft.height.trim() || "—",
      weight: draft.weight.trim() || "—",
      position: draft.position,
      batsThrows: draft.batsThrows,
      location: draft.athleteLocation.trim(),
      bio: draft.athleteBio.trim(),
      lookingForCoach: draft.lookingForCoach,
      openToScouts: draft.openToScouts,
      seasonLabel: `${draft.classYear} season`,
    };

    try {
      const res = await fetch("/api/athletes/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as { athlete: { id: string } };
        athleteProfileIdRef.current = data.athlete.id;
        return data.athlete.id;
      }
      if (res.status !== 503) {
        setError(t("onboard_error_save"));
        return null;
      }
    } catch {
      /* demo fallback below */
    }

    const profile = createProfile({
      userId: user.id,
      name: payload.name,
      email: user.email || draft.email,
      school: payload.school,
      classYear: payload.classYear,
      height: payload.height,
      weight: payload.weight,
      position: payload.position,
      batsThrows: payload.batsThrows,
      location: payload.location,
      bio: payload.bio,
      lookingForCoach: payload.lookingForCoach,
      openToScouts: payload.openToScouts,
      seasonLabel: payload.seasonLabel,
    });
    athleteProfileIdRef.current = profile.id;
    return profile.id;
  }

  async function goNext() {
    setError("");

    if (step === "account") {
      if (!user) {
        if (!draft.name.trim() || !draft.email.trim() || !draft.password) {
          setError(t("onboard_error_required"));
          return;
        }
        setSubmitting(true);
        const result = await signup(
          draft.email.trim(),
          draft.password,
          draft.name.trim(),
          draft.role,
        );
        setSubmitting(false);
        if (!result.ok) {
          setError(
            result.error === "EMAIL_TAKEN" ? t("signup_email_taken") : t("signup_error"),
          );
          return;
        }
        trackEvent("onboarding_account_complete", { role: draft.role });
      }
      setStep("intro");
      return;
    }

    if (step === "intro") {
      setStep("profile");
      return;
    }

    if (step === "profile") {
      if (draft.role === "coach") {
        const name = (user?.name || draft.name).trim();
        if (!name || !draft.sport || !draft.specialty || !draft.location || !draft.bio.trim()) {
          setError(t("onboard_error_required"));
          return;
        }
      } else {
        if (!draft.school.trim() || !draft.position.trim() || !draft.classYear.trim()) {
          setError(t("onboard_error_required"));
          return;
        }
      }
      setStep("details");
      return;
    }

    if (step === "details") {
      if (draft.role === "coach") {
        const ok = await saveCoachProfile();
        if (!ok) return;
      }
      if (draft.role === "athlete") {
        const id = await ensureAthleteProfile();
        if (!id) return;
      }
      setStep("social");
      return;
    }

    if (step === "social") {
      if (draft.role === "athlete" && user) {
        const profileId = await ensureAthleteProfile();
        if (profileId && draft.postCaption.trim()) {
          const name = user.name || draft.name;
          addPost({
            athleteId: profileId,
            athleteName: name,
            school: draft.school.trim(),
            position: draft.position,
            classYear: draft.classYear,
            avatarUrl:
              user.avatarUrl ??
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
            type: draft.postType as SocialPostType,
            caption: draft.postCaption.trim(),
            videoUrl: DEMO_VIDEOS[0]!,
            posterUrl:
              "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80",
          });
        }
      }
      setStep("finish");
      return;
    }
  }

  function finish() {
    if (!user) return;
    markOnboardingComplete(user.id);
    clearDraft();
    trackEvent("onboarding_complete", { role: draft.role });
    router.push(destinationFor(draft.role));
  }

  function toggleLanguage(lang: string) {
    patchDraft({
      languages: draft.languages.includes(lang)
        ? draft.languages.filter((l) => l !== lang)
        : [...draft.languages, lang],
    });
  }

  async function copyBookLink() {
    if (!bookUrl) return;
    try {
      await navigator.clipboard.writeText(bookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function shareBookLink() {
    if (!bookUrl || !navigator.share) {
      void copyBookLink();
      return;
    }
    try {
      await navigator.share({ title: "AthLink", url: bookUrl });
    } catch {
      /* ignore */
    }
  }

  if (!hydrated) {
    return (
      <OnboardingShell step="account" role={role} wizardMode>
        <div className="text-center text-brand-500">{t("loading")}</div>
      </OnboardingShell>
    );
  }

  const postTypeOptions: { value: OnboardingDraft["postType"]; label: string }[] = [
    { value: "practice", label: t("onboard_post_practice") },
    { value: "game", label: t("onboard_post_game") },
    { value: "training", label: t("onboard_post_training") },
    { value: "highlight", label: t("onboard_post_highlight") },
  ];

  return (
    <OnboardingShell step={step} role={role} wizardMode>
      {step === "account" && (
        <div>
          <h1 className="text-2xl font-bold text-brand-950">{t("onboard_account_title")}</h1>
          <p className="mt-2 text-brand-600">{t("onboard_account_sub")}</p>

          {user ? (
            <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
              <p className="text-sm font-semibold text-brand-500">{t("login_email")}</p>
              <p className="mt-1 text-lg font-bold text-brand-950">{user.email}</p>
              <p className="mt-4 text-sm text-brand-600">
                {user.name} · {user.role === "coach" ? t("role_coach") : t("role_athlete")}
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <div>
                <Label htmlFor="ob-name">{t("login_name")}</Label>
                <Input
                  id="ob-name"
                  value={draft.name}
                  onChange={(e) => patchDraft({ name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ob-email">{t("login_email")}</Label>
                <Input
                  id="ob-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => patchDraft({ email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ob-password">{t("login_password")}</Label>
                <Input
                  id="ob-password"
                  type="password"
                  value={draft.password}
                  onChange={(e) => patchDraft({ password: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" onClick={goBack}>
              {t("onboard_back")}
            </Button>
            <Button size="lg" className={primaryBtnClass} onClick={() => void goNext()} disabled={submitting}>
              {submitting ? t("loading") : t("onboard_next")}
            </Button>
          </div>
        </div>
      )}

      {step === "intro" && (
        <div>
          <h1 className="text-2xl font-bold text-brand-950">{t("onboard_intro_title")}</h1>
          <p className="mt-2 text-brand-600">{t("onboard_intro_sub")}</p>

          <ol className="mt-8 space-y-4">
            {[
              { icon: Users, title: t("onboard_intro_1_title"), desc: t("onboard_intro_1_desc") },
              {
                icon: CalendarDays,
                title: t("onboard_intro_2_title"),
                desc: t("onboard_intro_2_desc"),
              },
              {
                icon: Handshake,
                title: t("onboard_intro_3_title"),
                desc: t("onboard_intro_3_desc"),
              },
            ].map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-brand-950">{title}</p>
                  <p className="mt-1 text-sm text-brand-600">{desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" onClick={goBack}>
              {t("onboard_back")}
            </Button>
            <Button size="lg" className={primaryBtnClass} onClick={() => void goNext()}>
              {t("onboard_next")}
            </Button>
          </div>
        </div>
      )}

      {step === "profile" && (
        <div>
          <h1 className="text-2xl font-bold text-brand-950">{t("onboard_profile_title")}</h1>
          <p className="mt-2 text-brand-600">{t("onboard_profile_sub")}</p>

          {draft.role === "coach" ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="coach-name">{t("register_name")}</Label>
                <Input
                  id="coach-name"
                  value={user?.name || draft.name}
                  onChange={(e) => patchDraft({ name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="coach-sport">{t("register_sport")}</Label>
                <Select
                  id="coach-sport"
                  value={draft.sport}
                  onChange={(e) => patchDraft({ sport: e.target.value })}
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {sportLabel(t, s)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="coach-specialty">{t("register_specialty")}</Label>
                <Select
                  id="coach-specialty"
                  value={draft.specialty}
                  onChange={(e) => patchDraft({ specialty: e.target.value })}
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {specialtyLabel(t, s)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="coach-location">{t("register_location")}</Label>
                <Select
                  id="coach-location"
                  value={draft.location}
                  onChange={(e) => patchDraft({ location: e.target.value })}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="coach-bio">{t("register_bio")}</Label>
                <Textarea
                  id="coach-bio"
                  rows={4}
                  value={draft.bio}
                  onChange={(e) => patchDraft({ bio: e.target.value })}
                  placeholder={t("register_bio_ph")}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="ath-school">{t("onboard_athlete_school")}</Label>
                <Input
                  id="ath-school"
                  value={draft.school}
                  onChange={(e) => patchDraft({ school: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ath-position">{t("onboard_athlete_position")}</Label>
                <Input
                  id="ath-position"
                  value={draft.position}
                  onChange={(e) => patchDraft({ position: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ath-class">{t("onboard_athlete_class")}</Label>
                <Input
                  id="ath-class"
                  value={draft.classYear}
                  onChange={(e) => patchDraft({ classYear: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ath-location">{t("onboard_athlete_location")}</Label>
                <Input
                  id="ath-location"
                  value={draft.athleteLocation}
                  onChange={(e) => patchDraft({ athleteLocation: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ath-bio">{t("register_bio")}</Label>
                <Textarea
                  id="ath-bio"
                  rows={3}
                  value={draft.athleteBio}
                  onChange={(e) => patchDraft({ athleteBio: e.target.value })}
                  placeholder={t("onboard_athlete_bio_ph")}
                />
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" onClick={goBack}>
              {t("onboard_back")}
            </Button>
            <Button size="lg" className={primaryBtnClass} onClick={() => void goNext()}>
              {t("onboard_next")}
            </Button>
          </div>
        </div>
      )}

      {step === "details" && (
        <div>
          <h1 className="text-2xl font-bold text-brand-950">{t("onboard_details_title")}</h1>
          <p className="mt-2 text-brand-600">{t("onboard_details_sub")}</p>

          {draft.role === "coach" ? (
            <div className="mt-8 space-y-5">
              <div>
                <Label htmlFor="coach-price">{t("register_price")}</Label>
                <Input
                  id="coach-price"
                  type="number"
                  min={40}
                  max={300}
                  step={5}
                  value={draft.price}
                  onChange={(e) => patchDraft({ price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t("register_languages")}</Label>
                <p className="mb-2 text-xs text-brand-500">{t("register_languages_hint")}</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const selected = draft.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                          selected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-brand-200 bg-surface text-brand-700 hover:border-brand-400",
                        )}
                      >
                        {languageLabel(t, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ath-height">{t("onboard_athlete_height")}</Label>
                <Input
                  id="ath-height"
                  value={draft.height}
                  onChange={(e) => patchDraft({ height: e.target.value })}
                  placeholder={'5\'10"'}
                />
              </div>
              <div>
                <Label htmlFor="ath-weight">{t("onboard_athlete_weight")}</Label>
                <Input
                  id="ath-weight"
                  value={draft.weight}
                  onChange={(e) => patchDraft({ weight: e.target.value })}
                  placeholder="175 lbs"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ath-bt">{t("onboard_athlete_bats")}</Label>
                <Input
                  id="ath-bt"
                  value={draft.batsThrows}
                  onChange={(e) => patchDraft({ batsThrows: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.lookingForCoach}
                  onChange={(e) => patchDraft({ lookingForCoach: e.target.checked })}
                  className="h-4 w-4 rounded border-brand-300 text-brand-600"
                />
                <span className="text-sm font-medium text-brand-800">{t("onboard_athlete_looking")}</span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.openToScouts}
                  onChange={(e) => patchDraft({ openToScouts: e.target.checked })}
                  className="h-4 w-4 rounded border-brand-300 text-brand-600"
                />
                <span className="text-sm font-medium text-brand-800">{t("onboard_athlete_scouts")}</span>
              </label>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" onClick={goBack}>
              {t("onboard_back")}
            </Button>
            <Button size="lg" className={primaryBtnClass} onClick={() => void goNext()} disabled={submitting}>
              {submitting ? t("loading") : t("onboard_next")}
            </Button>
          </div>
        </div>
      )}

      {step === "social" && (
        <div>
          <h1 className="text-2xl font-bold text-brand-950">{t("onboard_social_title")}</h1>
          <p className="mt-2 text-brand-600">
            {draft.role === "coach" ? t("onboard_social_coach_sub") : t("onboard_social_athlete_sub")}
          </p>

          {draft.role === "coach" ? (
            <div className="mt-8 rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
              <p className="text-sm text-brand-700">{t("onboard_social_coach_body")}</p>
              {coachId && qrSrc ? (
                <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <div className="rounded-2xl border border-brand-100 bg-surface-elevated p-3 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrSrc} alt="QR" width={200} height={200} className="h-48 w-48" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="break-all rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                      {bookUrl}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => void copyBookLink()}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? t("social_copied") : t("qr_copy")}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => void shareBookLink()}>
                        <Share2 className="h-4 w-4" />
                        {t("qr_open_page")}
                      </Button>
                      <Link href={`/c/${coachId}`}>
                        <Button type="button" variant="secondary">
                          {t("analytics_view_public")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-brand-500">{t("onboard_error_save")}</p>
              )}
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <div>
                <Label htmlFor="post-type">{t("onboard_post_type")}</Label>
                <Select
                  id="post-type"
                  value={draft.postType}
                  onChange={(e) =>
                    patchDraft({ postType: e.target.value as OnboardingDraft["postType"] })
                  }
                >
                  {postTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="post-caption">{t("onboard_post_caption")}</Label>
                <Textarea
                  id="post-caption"
                  rows={4}
                  value={draft.postCaption}
                  onChange={(e) => patchDraft({ postCaption: e.target.value })}
                  placeholder={t("onboard_post_caption_ph")}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" onClick={goBack}>
              {t("onboard_back")}
            </Button>
            {draft.role === "athlete" && !draft.postCaption.trim() && (
              <Button variant="ghost" onClick={() => void goNext()}>
                {t("onboard_skip")}
              </Button>
            )}
            <Button size="lg" className={primaryBtnClass} onClick={() => void goNext()}>
              {t("onboard_next")}
            </Button>
          </div>
        </div>
      )}

      {step === "finish" && (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-brand-950">{t("onboard_finish_title")}</h1>
          <p className="mt-2 text-brand-600">{t("onboard_finish_sub")}</p>

          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-brand-700">
            <li className="rounded-xl border border-brand-100 bg-surface px-4 py-3">
              {draft.role === "coach" ? t("onboard_finish_coach_1") : t("onboard_finish_athlete_1")}
            </li>
            <li className="rounded-xl border border-brand-100 bg-surface px-4 py-3">
              {draft.role === "coach" ? t("onboard_finish_coach_2") : t("onboard_finish_athlete_2")}
            </li>
            <li className="rounded-xl border border-brand-100 bg-surface px-4 py-3">
              {t("onboard_finish_3")}
            </li>
          </ul>

          <Button className={cn("mt-8 w-full sm:w-auto", primaryBtnClass)} size="lg" onClick={finish} disabled={!user}>
            {t("onboard_start")}
          </Button>
        </div>
      )}
    </OnboardingShell>
  );
}
