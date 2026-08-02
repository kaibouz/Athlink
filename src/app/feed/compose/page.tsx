"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { useSocial } from "@/lib/social-store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import type { SocialPostType } from "@/types";

const DEMO_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

export default function ComposePostPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { addPost, getMyProfile, profiles } = useSocial();
  const router = useRouter();

  const profile = useMemo(() => {
    if (!user) return profiles[0];
    return getMyProfile(user.id) ?? profiles[0];
  }, [user, getMyProfile, profiles]);

  const [type, setType] = useState<SocialPostType>("practice");
  const [caption, setCaption] = useState("");
  const [statsNote, setStatsNote] = useState(() => {
    if (!profile) return "";
    const s = profile.seasonStats;
    if (s.avg) return `${s.seasonLabel}: AVG ${s.avg}`;
    if (s.era) return `${s.seasonLabel}: ERA ${s.era}`;
    return s.seasonLabel;
  });
  const [videoIdx, setVideoIdx] = useState(0);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("social_compose_title")}</h1>
        <p className="mt-2 text-brand-600">{t("social_compose_login")}</p>
        <Link href="/login?next=/feed/compose" className="mt-6 inline-block">
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

  if (!profile) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !caption.trim()) return;
    const post = addPost({
      athleteId: profile.id,
      athleteName: profile.name,
      school: profile.school,
      position: profile.position,
      classYear: profile.classYear,
      avatarUrl: profile.avatarUrl,
      type,
      caption: caption.trim(),
      videoUrl: DEMO_VIDEOS[videoIdx],
      posterUrl:
        "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80",
      statsNote: statsNote.trim() || undefined,
    });
    router.push(`/athletes/${profile.id}?posted=${post.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">{t("social_compose_title")}</h1>
      <p className="mt-1 text-brand-600">{t("social_compose_sub")}</p>

      <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/80 p-4">
        <p className="text-xs font-semibold tracking-wide text-brand-500 uppercase">
          {t("social_compose_autofill")}
        </p>
        <p className="mt-2 text-sm font-bold text-brand-950">{profile.name}</p>
        <p className="text-sm text-brand-700">
          {profile.school} · {profile.position} · Class of {profile.classYear}
        </p>
        <p className="text-sm text-brand-600">
          {profile.height} / {profile.weight} · {profile.batsThrows} · {profile.email}
        </p>
        <Link
          href={`/athletes/${profile.id}/edit`}
          className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
        >
          {t("social_edit_profile")}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
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
          <Label htmlFor="video">{t("social_video")}</Label>
          <Select
            id="video"
            value={String(videoIdx)}
            onChange={(e) => setVideoIdx(Number(e.target.value))}
          >
            <option value="0">{t("social_video_demo")} 1</option>
            <option value="1">{t("social_video_demo")} 2</option>
            <option value="2">{t("social_video_demo")} 3</option>
          </Select>
          <p className="mt-1 text-xs text-brand-400">{t("social_video_hint")}</p>
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
        <Button type="submit" className="w-full" size="lg">
          {t("social_publish")}
        </Button>
        <p className="text-center text-xs text-brand-400">{t("social_publish_hint")}</p>
      </form>
    </div>
  );
}
