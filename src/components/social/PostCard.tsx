"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Play,
  Repeat2,
  Share,
} from "lucide-react";
import type { MessageKey } from "@/lib/i18n/messages";
import type { SocialPost } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { useSocial } from "@/lib/social-store";
import { Badge } from "@/components/ui/Badge";
import { AthleteOutreachButtons } from "@/components/social/AthleteOutreachButtons";
import { cn } from "@/lib/utils";

const typeKey: Record<SocialPost["type"], MessageKey> = {
  form: "social_type_form",
  practice: "social_type_practice",
  game: "social_type_game",
  training: "social_type_training",
  highlight: "social_type_highlight",
};

export function PostCard({
  post,
  variant = "card",
}: {
  post: SocialPost;
  variant?: "card" | "timeline";
}) {
  const { t, locale } = useLocale();
  const { profiles } = useSocial();
  const athlete = profiles.find((p) => p.id === post.athleteId);
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  function toggleLike() {
    setLiked((v) => {
      setLikes((n) => (v ? n - 1 : n + 1));
      return !v;
    });
  }

  if (variant === "timeline") {
    return (
      <article className="px-4 py-3 transition hover:bg-brand-50/40">
        <div className="flex gap-3">
          <Link href={`/athletes/${post.athleteId}`} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full bg-brand-50"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <Link
                href={`/athletes/${post.athleteId}`}
                className="font-bold text-brand-950 hover:underline"
              >
                {post.athleteName}
              </Link>
              <span className="text-sm text-brand-400">
                @{post.athleteId} ·{" "}
                {new Date(post.createdAt).toLocaleDateString(dateLocale)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-brand-500">
              {post.school} · {post.position} · Class of {post.classYear}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-brand-900">
              {post.caption}
            </p>
            {post.statsNote && (
              <p className="mt-1 text-xs font-medium text-brand-600">{post.statsNote}</p>
            )}

            <div className="relative mt-3 overflow-hidden rounded-2xl border border-brand-100 bg-black">
              <video
                className="aspect-video max-h-[360px] w-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster={post.posterUrl}
                src={post.videoUrl}
              >
                <track kind="captions" />
              </video>
              <div className="pointer-events-none absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
                <Play className="h-3 w-3" />
                {t(typeKey[post.type])}
              </div>
            </div>

            <div className="mt-2 flex max-w-md justify-between pr-4 text-brand-400">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-xs hover:bg-sky-50 hover:text-sky-600"
                aria-label="Reply"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-xs hover:bg-emerald-50 hover:text-emerald-600"
                aria-label="Repost"
              >
                <Repeat2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleLike}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full p-1.5 text-xs hover:bg-rose-50 hover:text-rose-600",
                  liked && "text-rose-600",
                )}
                aria-label="Like"
              >
                <Heart className={cn("h-4 w-4", liked && "fill-rose-600")} />
                {likes}
              </button>
              <Link
                href={`/athletes/${post.athleteId}`}
                className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-xs hover:bg-brand-50 hover:text-brand-600"
                aria-label={t("social_view_profile")}
              >
                <Share className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-3">
              <AthleteOutreachButtons
                athleteId={post.athleteId}
                athleteName={post.athleteName}
                email={athlete?.email}
                openToScouts={athlete?.openToScouts ?? true}
                className="w-full [&_button]:flex-1"
              />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-100 bg-surface shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <Link href={`/athletes/${post.athleteId}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.avatarUrl}
            alt=""
            className="h-11 w-11 rounded-xl bg-brand-50"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/athletes/${post.athleteId}`}
            className="font-bold text-brand-950 hover:text-brand-600"
          >
            {post.athleteName}
          </Link>
          <p className="truncate text-xs text-brand-500">
            {post.school} · {post.position} · Class of {post.classYear}
          </p>
        </div>
        <Badge>{t(typeKey[post.type])}</Badge>
      </div>

      <div className="relative bg-black">
        <video
          className="aspect-[9/14] max-h-[520px] w-full object-cover sm:aspect-video sm:max-h-[360px]"
          controls
          playsInline
          preload="metadata"
          poster={post.posterUrl}
          src={post.videoUrl}
        >
          <track kind="captions" />
        </video>
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold text-white">
          <Play className="h-3 w-3" />
          Short
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-sm leading-relaxed text-brand-800">{post.caption}</p>
        {post.statsNote && (
          <p className="text-xs font-medium text-brand-600">{post.statsNote}</p>
        )}

        <AthleteOutreachButtons
          athleteId={post.athleteId}
          athleteName={post.athleteName}
          email={athlete?.email}
          openToScouts={athlete?.openToScouts ?? true}
          className="w-full [&_button]:flex-1"
        />

        <div className="flex items-center justify-between pt-0.5 text-xs text-brand-400">
          <span>
            {new Date(post.createdAt).toLocaleString(dateLocale)} · {likes} likes
          </span>
          <Link
            href={`/athletes/${post.athleteId}`}
            className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-800"
          >
            <Share className="h-3.5 w-3.5" />
            {t("social_view_profile")}
          </Link>
        </div>
      </div>
    </article>
  );
}
