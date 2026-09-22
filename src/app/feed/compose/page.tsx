"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useSocial } from "@/lib/social-store";
import { useLocale } from "@/lib/i18n/provider";
import { signInHref } from "@/lib/market-to-platform";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import type { SocialPostType } from "@/types";

const SAMPLE_VIDEOS = [
  {
    id: "sample-1",
    labelKey: "social_video_demo" as const,
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80",
  },
  {
    id: "sample-2",
    labelKey: "social_video_demo" as const,
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1508344928928-7528d0e3b3a5?w=800&q=80",
  },
  {
    id: "sample-3",
    labelKey: "social_video_demo" as const,
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80",
  },
];

export default function ComposePostPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { addPost, getMyProfile, profiles, createProfile, refresh, apiEnabled } = useSocial();
  const router = useRouter();

  const [type, setType] = useState<SocialPostType>("practice");
  const [caption, setCaption] = useState("");
  const [statsNote, setStatsNote] = useState("");
  const [source, setSource] = useState<"sample" | "url" | "file">("file");
  const [sampleId, setSampleId] = useState(SAMPLE_VIDEOS[0].id);
  const [customUrl, setCustomUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState(SAMPLE_VIDEOS[0].poster);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const profile = useMemo(() => {
    if (!user) return undefined;
    return getMyProfile(user.id);
  }, [user, getMyProfile, profiles]);

  // Ensure a local profile exists for compose autofill (API also ensures DB row on publish).
  useEffect(() => {
    if (!user || user.role === "coach") return;
    if (getMyProfile(user.id)) return;
    createProfile({
      userId: user.id,
      name: user.name,
      email: user.email,
      school: "—",
      classYear: String(new Date().getFullYear() + 2),
      height: "—",
      weight: "—",
      position: "Athlete",
      batsThrows: "R/R",
      location: "—",
      bio: "",
      lookingForCoach: true,
      openToScouts: false,
    });
  }, [user, getMyProfile, createProfile]);

  useEffect(() => {
    if (!profile) return;
    const s = profile.seasonStats;
    if (s.avg) setStatsNote(`${s.seasonLabel}: AVG ${s.avg}`);
    else if (s.era) setStatsNote(`${s.seasonLabel}: ERA ${s.era}`);
    else setStatsNote(s.seasonLabel);
  }, [profile]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("social_compose_title")}</h1>
        <p className="mt-2 text-brand-600">{t("social_compose_login")}</p>
        <Link href={signInHref("/feed/compose")} className="mt-6 inline-block">
          <Button>{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  if (user.role === "coach") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-brand-700">{t("social_compose_coach_block")}</p>
        <Link href="/sns" className="mt-4 inline-block">
          <Button variant="outline">{t("social_feed_title")}</Button>
        </Link>
      </div>
    );
  }

  const resolvedProfile = profile ?? getMyProfile(user.id);
  if (!resolvedProfile) return null;

  async function uploadFile(file: File, as: "video" | "image") {
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/social/upload", {
        method: "POST",
        credentials: "include",
        body,
      });
      if (!res.ok) {
        setError(t("social_upload_fail"));
        return;
      }
      const data = (await res.json()) as { url: string };
      if (as === "video") {
        setUploadedUrl(data.url);
        setSource("file");
      } else {
        setPosterUrl(data.url);
      }
    } catch {
      setError(t("social_upload_fail"));
    } finally {
      setUploading(false);
    }
  }

  function resolveVideo(): { videoUrl: string; poster: string } | null {
    if (source === "file") {
      if (!uploadedUrl) return null;
      return { videoUrl: uploadedUrl, poster: posterUrl };
    }
    if (source === "url") {
      const url = customUrl.trim();
      if (!url) return null;
      return { videoUrl: url, poster: posterUrl };
    }
    const sample = SAMPLE_VIDEOS.find((v) => v.id === sampleId) ?? SAMPLE_VIDEOS[0];
    return { videoUrl: sample.url, poster: sample.poster };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!caption.trim()) return;
    const media = resolveVideo();
    if (!media) {
      setError(t("social_video_required"));
      return;
    }
    setSubmitting(true);
    try {
      const post = await addPost({
        athleteId: resolvedProfile!.id,
        athleteName: resolvedProfile!.name,
        school: resolvedProfile!.school,
        position: resolvedProfile!.position,
        classYear: resolvedProfile!.classYear,
        avatarUrl: resolvedProfile!.avatarUrl,
        type,
        caption: caption.trim(),
        videoUrl: media.videoUrl,
        posterUrl: media.poster,
        statsNote: statsNote.trim() || undefined,
      });
      await refresh();
      router.push(`/sns?posted=${post.id}`);
    } catch {
      setError(t("social_publish_fail"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">{t("social_compose_title")}</h1>
      <p className="mt-1 text-brand-600">{t("social_compose_sub")}</p>
      <p className="mt-2 text-xs font-medium text-brand-500">
        {apiEnabled ? t("social_live_hint") : t("social_local_hint")}
      </p>

      <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/80 p-4">
        <p className="text-xs font-semibold tracking-wide text-brand-500 uppercase">
          {t("social_compose_autofill")}
        </p>
        <p className="mt-2 text-sm font-bold text-brand-950">{resolvedProfile.name}</p>
        <p className="text-sm text-brand-700">
          {resolvedProfile.school} · {resolvedProfile.position} · Class of {resolvedProfile.classYear}
        </p>
        <Link
          href={`/athletes/${resolvedProfile.id}/edit`}
          className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
        >
          {t("social_edit_profile")}
        </Link>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-6 space-y-4 rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm"
      >
        <div>
          <Label htmlFor="type">{t("social_post_type")}</Label>
          <Select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as SocialPostType)}
          >
            <option value="form">{t("social_type_form")}</option>
            <option value="practice">{t("social_type_practice")}</option>
            <option value="training">{t("social_type_training")}</option>
            <option value="game">{t("social_type_game")}</option>
            <option value="highlight">{t("social_type_highlight")}</option>
          </Select>
        </div>

        <div>
          <Label>{t("social_video")}</Label>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            {(
              [
                ["file", t("social_video_upload")],
                ["url", t("social_video_url")],
                ["sample", t("social_video_demo")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSource(id)}
                className={`rounded-full border px-3 py-1 ${
                  source === id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 text-brand-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {source === "file" ? (
            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 px-4 py-8 text-center hover:border-brand-500">
                <Upload className="h-6 w-6 text-brand-600" />
                <span className="text-sm font-semibold text-brand-800">
                  {uploading ? t("social_uploading") : t("social_pick_video")}
                </span>
                <span className="text-xs text-brand-500">{t("social_video_hint")}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f, "video");
                  }}
                />
              </label>
              {uploadedUrl ? (
                <p className="truncate text-xs text-emerald-600">
                  {t("social_upload_ok")}: {uploadedUrl}
                </p>
              ) : null}
            </div>
          ) : null}

          {source === "url" ? (
            <div className="mt-3">
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          ) : null}

          {source === "sample" ? (
            <div className="mt-3">
              <Select
                value={sampleId}
                onChange={(e) => {
                  setSampleId(e.target.value);
                  const s = SAMPLE_VIDEOS.find((v) => v.id === e.target.value);
                  if (s) setPosterUrl(s.poster);
                }}
              >
                {SAMPLE_VIDEOS.map((v, i) => (
                  <option key={v.id} value={v.id}>
                    {t(v.labelKey)} {i + 1}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>

        <div>
          <Label htmlFor="caption">{t("social_caption")}</Label>
          <Textarea
            id="caption"
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t("social_caption_ph")}
            required
          />
        </div>
        <div>
          <Label htmlFor="stats">{t("social_stats_note")}</Label>
          <Input
            id="stats"
            value={statsNote}
            onChange={(e) => setStatsNote(e.target.value)}
            placeholder={t("social_stats_note_ph")}
          />
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={submitting || uploading}>
          {submitting ? t("social_publishing") : t("social_publish")}
        </Button>
        <p className="text-center text-xs text-brand-400">{t("social_publish_hint")}</p>
      </form>
    </div>
  );
}
