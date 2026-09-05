"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Radar, Search } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useSocial } from "@/lib/social-store";
import { useLocale } from "@/lib/i18n/provider";
import { PostCard } from "@/components/social/PostCard";
import { FeedViewer } from "@/components/social/FeedViewer";
import { AthleteOutreachButtons } from "@/components/social/AthleteOutreachButtons";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import type { SocialPostType } from "@/types";
import { cn } from "@/lib/utils";

type SnsTab = "timeline" | "scout";

/** X-style SNS + scout discovery */
export default function SnsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { posts, profiles } = useSocial();
  const [tab, setTab] = useState<SnsTab>("timeline");
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | SocialPostType>("");
  const [scoutOpenOnly, setScoutOpenOnly] = useState(true);
  const [position, setPosition] = useState("");
  const [feedMode, setFeedMode] = useState<"reel" | "list">("reel");

  const isCoach = user?.role === "coach";

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const query = q.trim().toLowerCase();
      const matchesQ =
        !query ||
        p.athleteName.toLowerCase().includes(query) ||
        p.school.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query) ||
        p.caption.toLowerCase().includes(query);
      const matchesType = !type || p.type === type;
      return matchesQ && matchesType;
    });
  }, [posts, q, type]);

  const scoutProfiles = useMemo(() => {
    const query = q.trim().toLowerCase();
    return profiles.filter((p) => {
      if (scoutOpenOnly && !p.openToScouts) return false;
      if (position && !p.position.toLowerCase().includes(position.toLowerCase())) {
        return false;
      }
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.school.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    });
  }, [profiles, q, scoutOpenOnly, position]);

  const positions = useMemo(() => {
    const set = new Set(profiles.map((p) => p.position.split("/")[0].trim()));
    return [...set].filter(Boolean).slice(0, 8);
  }, [profiles]);

  return (
    <div className="mx-app mx-auto w-full max-w-6xl min-h-[70vh] border-x border-[color:var(--mx-border)]">
      <header className="sticky top-14 z-20 border-b border-[color:var(--mx-border)] bg-[color:var(--mx-bg)]/90 backdrop-blur-md md:top-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h1 className="text-xl font-black tracking-tight text-[color:var(--mx-text)]">
              {t("nav_feed")}
            </h1>
            <p className="text-xs text-[color:var(--mx-dimmer)]">
              {isCoach ? t("sns_sub_coach") : t("sns_sub")}
            </p>
          </div>
          {user?.role !== "coach" && (
            <Link href="/feed/compose">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                {t("sns_post")}
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2">
          {(
            [
              ["timeline", t("sns_tab_timeline")],
              ["scout", t("sns_tab_scout")],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative py-3 text-sm font-semibold transition",
                tab === id ? "text-brand-950" : "text-brand-400 hover:bg-brand-50/60",
              )}
            >
              {label}
              {tab === id && (
                <span className="absolute inset-x-10 bottom-0 h-1 rounded-full bg-brand-600" />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="border-b border-brand-100 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
          <Input
            className="pl-9"
            placeholder={
              tab === "scout" ? t("sns_scout_search_ph") : t("social_search_ph")
            }
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {tab === "timeline" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["", t("search_all")],
                ["form", t("social_type_form")],
                ["practice", t("social_type_practice")],
                ["game", t("social_type_game")],
                ["highlight", t("social_type_highlight")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value || "all"}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  type === value
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 bg-surface text-brand-700 hover:border-brand-400",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-brand-700">
              <input
                type="checkbox"
                checked={scoutOpenOnly}
                onChange={(e) => setScoutOpenOnly(e.target.checked)}
                className="rounded border-brand-300"
              />
              {t("sns_scout_open_only")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPosition("")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  !position
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 text-brand-700",
                )}
              >
                {t("search_all")}
              </button>
              {positions.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    position === pos
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-brand-200 text-brand-700",
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {tab === "timeline" ? (
        <div>
          <div className="flex items-center gap-2 border-b border-[color:var(--mx-border)] px-4 py-2">
            <div className="inline-flex overflow-hidden rounded-full border border-[color:var(--mx-border-strong)] text-xs font-semibold">
              {(
                [
                  ["reel", "Reel"],
                  ["list", "List"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFeedMode(id)}
                  className={cn(
                    "px-3 py-1",
                    feedMode === id
                      ? "bg-[color:var(--mx-accent)] text-black"
                      : "text-[color:var(--mx-dim)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {user && user.role !== "coach" && (
              <Link href="/feed/compose" className="mx-btn mx-btn-ghost ml-auto text-[0.72rem]">
                <Plus className="h-3.5 w-3.5" /> {t("sns_post")}
              </Link>
            )}
          </div>

          {feedMode === "reel" ? (
            <FeedViewer posts={filteredPosts} />
          ) : (
            <div className="divide-y divide-brand-100">
              {filteredPosts.length === 0 ? (
                <div className="px-4 py-16 text-center text-brand-500">
                  {t("social_feed_empty")}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} variant="timeline" />
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-brand-100">
          <div className="flex items-center gap-2 bg-brand-50/60 px-4 py-2 text-xs font-semibold text-brand-600">
            <Radar className="h-3.5 w-3.5" />
            {t("sns_scout_hint")}
          </div>
          {scoutProfiles.length === 0 ? (
            <div className="px-4 py-16 text-center text-brand-500">
              {t("sns_scout_empty")}
            </div>
          ) : (
            scoutProfiles.map((athlete) => (
              <article
                key={athlete.id}
                className="px-4 py-4 transition hover:bg-brand-50/40"
              >
                <div className="flex gap-3">
                  <Link href={`/athletes/${athlete.id}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={athlete.avatarUrl}
                      alt=""
                      className="h-12 w-12 rounded-full bg-brand-50"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/athletes/${athlete.id}`}
                        className="font-bold text-brand-950 hover:underline"
                      >
                        {athlete.name}
                      </Link>
                      {athlete.openToScouts && (
                        <Badge variant="verified">{t("social_open_scouts")}</Badge>
                      )}
                      {athlete.lookingForCoach && (
                        <Badge>{t("social_looking_coach")}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-brand-500">
                      {athlete.school} · {athlete.position} · {athlete.classYear}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-brand-700">
                      {athlete.bio}
                    </p>
                    <p className="mt-1 text-xs text-brand-500">
                      {athlete.height} / {athlete.weight} · {athlete.location}
                      {athlete.seasonStats.avg
                        ? ` · AVG ${athlete.seasonStats.avg}`
                        : ""}
                    </p>
                    <div className="mt-3">
                      <AthleteOutreachButtons
                        athleteId={athlete.id}
                        athleteName={athlete.name}
                        email={athlete.email}
                        openToScouts={athlete.openToScouts}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
