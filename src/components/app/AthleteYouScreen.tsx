"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Camera, LogOut } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useSocial } from "@/lib/social-store";
import { useLocale } from "@/lib/i18n/provider";
import { AthleteProgressScreen } from "@/components/app/AthleteProgressScreen";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type YouTab = "posts" | "progress" | "coaches";

function handleFromName(name: string) {
  return `@${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16)}`;
}

/** Concept Athlete You — banner, avatar, stats, tabs Posts / Progress / Coaches */
export function AthleteYouScreen() {
  const { user, logout, bookings } = useAuth();
  const { profiles, posts, getMyProfile } = useSocial();
  const { t } = useLocale();
  const [tab, setTab] = useState<YouTab>("posts");

  const profile = useMemo(() => {
    if (!user) return undefined;
    return (
      getMyProfile(user.id) ??
      profiles.find((p) => p.userId === user.id) ??
      profiles[0]
    );
  }, [user, getMyProfile, profiles]);

  const myPosts = useMemo(() => {
    if (!profile) return [];
    return posts.filter((p) => p.athleteId === profile.id);
  }, [posts, profile]);

  const myBookings = useMemo(() => {
    if (!user) return [];
    return bookings.filter(
      (b) =>
        b.athleteId === user.id &&
        (b.status === "pending" || b.status === "confirmed" || b.status === "completed"),
    );
  }, [bookings, user]);

  const coaches = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const b of myBookings) {
      const prev = map.get(b.coachId);
      if (prev) prev.count += 1;
      else map.set(b.coachId, { id: b.coachId, name: b.coachName, count: 1 });
    }
    return [...map.values()];
  }, [myBookings]);

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("you")}</h1>
        <p className="mt-2 text-[color:var(--mx-dim)]">{t("me_login_hint")}</p>
        <Link href="/sign-in?redirect_url=/me" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  const name = profile?.name ?? user.name;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sessions = myBookings.length || 14;
  const breakdowns = Math.max(3, Math.round(sessions * 0.6));
  const coachCount = coaches.length || 2;
  const followers = 128;
  const editHref = profile ? `/athletes/${profile.id}/edit` : "/athletes/a1/edit";
  const publicHref = profile ? `/athletes/${profile.id}` : "/athletes/a1";

  return (
    <div className="mx-app mx-role-athlete mx-auto max-w-2xl px-0 pb-10 sm:px-6 sm:py-6">
      <div className="overflow-hidden sm:rounded-2xl sm:border sm:border-[color:var(--mx-border)]">
        <div className="mx-abanner">
          <Link href={editHref} className="mx-aedit">
            {t("you_edit")}
          </Link>
        </div>
        <div className="relative px-4 pb-3 sm:px-5">
          <div className="mx-ppfp !mt-[-33px] !h-[66px] !w-[66px]">
            {profile?.avatarUrl || user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile?.avatarUrl ?? user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {initials}
              </span>
            )}
            <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[color:var(--mx-bg)] bg-[color:var(--mx-blue-1)] text-white">
              <Camera className="h-2.5 w-2.5" />
            </span>
          </div>

          <h1 className="mt-2 text-xl font-black tracking-tight text-[color:var(--mx-text)]">
            {name}
          </h1>
          <p className="text-sm text-[color:var(--mx-dimmer)]">{handleFromName(name)}</p>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--mx-dim)]">
            {profile?.bio || t("you_bio_fallback")}
          </p>
          <div className="mx-pmeta mt-2">
            <span>
              {profile?.position ?? "Athlete"}
              {profile?.classYear ? ` · Class of ${profile.classYear}` : null}
            </span>
            <span>{profile?.school ?? profile?.location ?? "South Bay LA"}</span>
          </div>

          <div className="mx-pstats mt-3 !grid-cols-4">
            <div>
              <b>{sessions}</b>
              {t("you_stat_sessions")}
            </div>
            <div>
              <b>{breakdowns}</b>
              {t("you_stat_breakdowns")}
            </div>
            <div>
              <b>{coachCount}</b>
              {t("you_stat_coaches")}
            </div>
            <div>
              <b>{followers}</b>
              {t("you_stat_followers")}
            </div>
          </div>

          <div className="mx-ptabs mt-2" role="tablist">
            {(
              [
                ["posts", t("you_tab_posts")],
                ["progress", t("you_tab_progress")],
                ["coaches", t("you_tab_coaches")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={cn("mx-ptab", tab === id && "on")}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 sm:px-0">
        {tab === "posts" ? (
          myPosts.length === 0 ? (
            <div className="mx-card text-center">
              <p className="text-sm text-[color:var(--mx-dim)]">{t("you_posts_empty")}</p>
              <Link href="/sns" className="mx-btn mx-btn-accent mt-3 inline-flex border-0">
                {t("nav_feed")}
              </Link>
            </div>
          ) : (
            <div className="mx-apost-grid">
              {myPosts.slice(0, 9).map((p) => (
                <Link key={p.id} href={publicHref} className="mx-apost">
                  {p.statsNote ? <span className="mx-apost-tag">AI</span> : null}
                  <span className="relative z-[1] text-[9px] text-[color:var(--mx-dimmer)] line-clamp-2">
                    {p.caption}
                  </span>
                </Link>
              ))}
            </div>
          )
        ) : null}

        {tab === "progress" ? (
          <div className="[&_.mx-app]:!bg-transparent [&_.mx-app]:px-0 [&_.mx-app]:py-0">
            <AthleteProgressScreen />
          </div>
        ) : null}

        {tab === "coaches" ? (
          coaches.length === 0 ? (
            <div className="mx-card text-center">
              <p className="text-sm text-[color:var(--mx-dim)]">{t("you_coaches_empty")}</p>
              <Link href="/search" className="mx-btn mx-btn-accent mt-3 inline-flex border-0">
                {t("nav_book")}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {coaches.map((c) => (
                <Link key={c.id} href={`/coaches/${c.id}`} className="mx-li">
                  <div className="mx-avatar" aria-hidden>
                    {c.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="mx-w">
                    <b>{c.name}</b>
                    <span>
                      {c.count} {t("you_stat_sessions")}
                    </span>
                  </div>
                  <div className="mx-r text-[color:var(--mx-blue-2)]">›</div>
                </Link>
              ))}
            </div>
          )
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={publicHref} className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
            {t("me_view_public")}
          </Link>
          <Link href="/progress" className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
            {t("nav_progress")}
          </Link>
          <button
            type="button"
            className="mx-btn mx-btn-ghost flex-1 text-[0.75rem] text-[color:var(--mx-red)]"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("nav_logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
