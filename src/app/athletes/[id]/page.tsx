"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Check, Link2, Mail, Share2 } from "lucide-react";
import { Suspense } from "react";
import { useSocial } from "@/lib/social-store";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { PostCard } from "@/components/social/PostCard";
import { AthleteOutreachButtons } from "@/components/social/AthleteOutreachButtons";
import { PastRecordsPanel } from "@/components/social/PastRecordsPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { CaRegionId } from "@/lib/dashboard-analytics";

function regionFromLocation(loc: string): CaRegionId {
  const l = loc.toLowerCase();
  if (l.includes("orange")) return "oc";
  if (l.includes("diego")) return "sd";
  if (l.includes("francisco") || l.includes("bay") || l.includes("jose")) return "bay";
  if (l.includes("sacramento")) return "sac";
  if (l.includes("inland") || l.includes("riverside")) return "ie";
  if (l.includes("fresno") || l.includes("central")) return "cv";
  return "la";
}

function AthleteProfileContent() {
  const { t } = useLocale();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const { profiles, posts } = useSocial();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const athlete = profiles.find((p) => p.id === params.id);
  const athletePosts = useMemo(
    () => posts.filter((p) => p.athleteId === params.id),
    [posts, params.id],
  );
  const justPosted = search.get("posted");

  if (!athlete) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-medium text-brand-800">{t("social_athlete_missing")}</p>
        <Link href="/sns" className="mt-4 inline-block">
          <Button variant="outline">{t("social_feed_title")}</Button>
        </Link>
      </div>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/athletes/${athlete.id}`
      : `/athletes/${athlete.id}`;

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const s = athlete.seasonStats;
  const isOwner = user?.id === athlete.userId;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {justPosted && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {t("social_posted_ok")}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-surface shadow-sm">
        <div className="bg-gradient-to-r from-ink to-brand-600 px-6 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={athlete.avatarUrl}
              alt=""
              className="h-24 w-24 rounded-2xl border-4 border-white/30 bg-surface"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-black">{athlete.name}</h1>
              <p className="mt-1 text-white/75">
                {athlete.school} · Class of {athlete.classYear}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="bg-surface/20 text-white">{athlete.position}</Badge>
                <Badge className="bg-surface/20 text-white">{athlete.batsThrows}</Badge>
                {athlete.openToScouts && (
                  <Badge className="bg-amber-400/90 text-amber-950">
                    {t("social_open_scouts")}
                  </Badge>
                )}
                {athlete.lookingForCoach && (
                  <Badge className="bg-emerald-400/90 text-emerald-950">
                    {t("social_looking_coach")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-brand-50 p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase">{t("social_field_size")}</p>
            <p className="mt-1 font-semibold text-brand-900">
              {athlete.height} / {athlete.weight}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase">{t("social_field_location")}</p>
            <p className="mt-1 font-semibold text-brand-900">{athlete.location}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase">Email</p>
            <a
              href={`mailto:${athlete.email}`}
              className="mt-1 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              {athlete.email}
            </a>
          </div>
        </div>

        <div className="p-6">
          <p className="leading-relaxed text-brand-700">{athlete.bio}</p>

          <h2 className="mt-6 font-bold text-brand-950">{s.seasonLabel}</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {s.avg && (
              <Stat label="AVG" value={s.avg} />
            )}
            {s.obp && <Stat label="OBP" value={s.obp} />}
            {s.slg && <Stat label="SLG" value={s.slg} />}
            {s.hr != null && <Stat label="HR" value={String(s.hr)} />}
            {s.rbi != null && <Stat label="RBI" value={String(s.rbi)} />}
            {s.era && <Stat label="ERA" value={s.era} />}
            {s.wins != null && <Stat label="W" value={String(s.wins)} />}
            {s.strikeouts != null && <Stat label="K" value={String(s.strikeouts)} />}
            {s.games != null && <Stat label="G" value={String(s.games)} />}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyShare}>
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? t("social_copied") : t("social_share_link")}
            </Button>
            <a
              href={`mailto:?subject=${encodeURIComponent(`AthLink profile: ${athlete.name}`)}&body=${encodeURIComponent(shareUrl)}`}
            >
              <Button variant="secondary">
                <Link2 className="h-4 w-4" />
                {t("social_share_email")}
              </Button>
            </a>
            {!isOwner && (
              <AthleteOutreachButtons
                athleteId={athlete.id}
                athleteName={athlete.name}
                email={athlete.email}
                openToScouts={athlete.openToScouts}
                size="md"
              />
            )}
            {isOwner && (
              <>
                <Link href={`/athletes/${athlete.id}/edit`}>
                  <Button variant="ghost">{t("social_edit_profile")}</Button>
                </Link>
                <Link href="/feed/compose">
                  <Button>{t("social_post_cta")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6">
        <PastRecordsPanel regionHint={regionFromLocation(athlete.location)} />
      </div>

      <h2 className="mt-10 mb-4 text-xl font-bold text-brand-950">
        {t("social_videos_heading")} ({athletePosts.length})
      </h2>
      <div className="space-y-5">
        {athletePosts.length === 0 ? (
          <p className="text-sm text-brand-500">{t("social_no_videos")}</p>
        ) : (
          athletePosts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-brand-50 px-3 py-2 text-center">
      <p className="text-[10px] font-semibold tracking-wide text-brand-400 uppercase">{label}</p>
      <p className="text-lg font-bold text-brand-950">{value}</p>
    </div>
  );
}

export default function AthleteProfilePage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div className="p-8 text-center">{t("loading")}</div>}>
      <AthleteProfileContent />
    </Suspense>
  );
}
