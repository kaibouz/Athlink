"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Upload, Video } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { ProUpgradeBanner, usePlatformPlan } from "@/components/plans/PlanComparison";
import { ATHLETE_FREE } from "@/lib/platform-plans";
import type { AiBreakdown } from "@/types";

const POSTER_SWING = "https://images.unsplash.com/photo-1566577739112-5180d4bf694c?w=800&q=80";
const POSTER_PITCH = "https://images.unsplash.com/photo-1508344928928-7528d0e3b3a5?w=800&q=80";

type ClipType = "swing" | "pitching";

const CLIP_PRESETS: { id: string; label: string; url: string; poster: string; type: ClipType }[] = [
  {
    id: "swing-front",
    label: "Batting practice — front angle",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: POSTER_SWING,
    type: "swing",
  },
  {
    id: "pitch-glove",
    label: "Bullpen — glove side",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: POSTER_PITCH,
    type: "pitching",
  },
  {
    id: "swing-side",
    label: "Cage session — side angle",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: POSTER_SWING,
    type: "swing",
  },
];

export default function NewBreakdownPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const { isPro } = usePlatformPlan();

  const [selectedId, setSelectedId] = useState(CLIP_PRESETS[0].id);
  const [customUrl, setCustomUrl] = useState("");
  const [analysisType, setAnalysisType] = useState<ClipType>("swing");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [planLimited, setPlanLimited] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(
    isPro ? null : ATHLETE_FREE.limits.aiBreakdownsPerMonth,
  );

  const preset = CLIP_PRESETS.find((c) => c.id === selectedId);
  const usingCustom = selectedId === "custom";
  const clipUrl = usingCustom ? customUrl.trim() : preset?.url ?? "";
  const posterUrl = usingCustom ? undefined : preset?.poster;

  useEffect(() => {
    if (!user || user.role !== "athlete") return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/breakdowns", { credentials: "same-origin" });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as { remainingThisMonth?: number | null };
        if (!cancelled && json.remainingThisMonth !== undefined) {
          setRemaining(json.remainingThisMonth);
          setPlanLimited(json.remainingThisMonth === 0);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function pick(id: string, type?: ClipType) {
    setSelectedId(id);
    if (type) setAnalysisType(type);
  }

  async function run() {
    setError("");
    if (!clipUrl) {
      setError(t("plan_ai_need_clip"));
      return;
    }
    if (planLimited) {
      setError(t("plan_ai_limit_error"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/breakdowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ clipUrl, posterUrl, analysisType, notes: notes.trim() || undefined }),
      });
      if (res.status === 402) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          remainingThisMonth?: number;
        };
        if (body.error === "PLAN_LIMIT") {
          setPlanLimited(true);
          setRemaining(body.remainingThisMonth ?? 0);
          setError(t("plan_ai_limit_error"));
          return;
        }
      }
      if (!res.ok) {
        setError(res.status === 403 ? t("plan_ai_athlete_only") : t("plan_ai_start_fail"));
        return;
      }
      const json = (await res.json()) as {
        breakdown?: AiBreakdown;
        remainingThisMonth?: number | null;
      };
      if (json.remainingThisMonth !== undefined) setRemaining(json.remainingThisMonth);
      if (json.breakdown?.id) {
        router.push(`/breakdown/${json.breakdown.id}`);
      } else {
        setError(t("plan_ai_start_fail"));
      }
    } catch {
      setError(t("plan_ai_start_fail"));
    } finally {
      setSubmitting(false);
    }
  }

  if (hydrated && (!user || user.role !== "athlete")) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold">{t("plan_ai_page_title")}</h1>
        <p className="mt-2 text-[color:var(--mx-dim)]">{t("plan_ai_sign_in")}</p>
        <Link href="/home" className="mx-btn mx-btn-ghost mt-6 inline-flex">
          {t("nav_home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-app mx-route-texture mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="mx-hdr">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-[var(--mx-dim)] hover:bg-white/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-[1.15rem]">{t("plan_ai_new_title")}</h1>
            <small>{t("plan_ai_new_sub")}</small>
          </div>
        </div>
      </header>

      {!isPro && remaining !== null ? (
        <p className="mb-3 text-[0.75rem] font-semibold text-[var(--mx-dim)]">
          {t("plan_ai_remaining", { n: remaining, limit: ATHLETE_FREE.limits.aiBreakdownsPerMonth ?? 2 })}
        </p>
      ) : null}

      {planLimited ? (
        <div className="mb-3">
          <ProUpgradeBanner titleKey="plan_ai_limit_title" bodyKey="plan_ai_limit_body" />
        </div>
      ) : null}

      <div className="mx-card mb-3">
        <div className="mx-t">1 · Choose a clip</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {CLIP_PRESETS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id, c.type)}
              className={`group relative overflow-hidden rounded-xl border text-left transition ${
                selectedId === c.id
                  ? "border-[var(--mx-accent)] ring-1 ring-[var(--mx-accent)]"
                  : "border-[var(--mx-border)] hover:border-[var(--mx-border-strong)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.poster} alt="" className="h-20 w-full object-cover opacity-80" />
              <span className="flex items-center gap-1 px-2 py-1.5 text-[0.68rem] font-medium">
                <Video className="h-3 w-3 shrink-0 text-[var(--mx-accent)]" />
                {c.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSelectedId("custom")}
          className={`mt-2 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-[0.75rem] transition ${
            usingCustom
              ? "border-[var(--mx-accent)] ring-1 ring-[var(--mx-accent)]"
              : "border-[var(--mx-border)] hover:border-[var(--mx-border-strong)]"
          }`}
        >
          <Upload className="h-3.5 w-3.5 text-[var(--mx-accent)]" /> Paste a clip URL
        </button>
        {usingCustom && (
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://…/clip.mp4"
            className="mx-input mt-2 w-full"
          />
        )}
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">2 · Analysis type</div>
        <div className="flex gap-2">
          {(["swing", "pitching"] as ClipType[]).map((tpe) => (
            <button
              key={tpe}
              type="button"
              onClick={() => setAnalysisType(tpe)}
              className={`mx-btn flex-1 text-[0.78rem] ${analysisType === tpe ? "mx-btn-accent border-0" : "mx-btn-ghost"}`}
            >
              {tpe === "swing" ? "Hitting / swing" : "Pitching / delivery"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-card mb-4">
        <div className="mx-t">3 · Notes for the analyzer (optional)</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Fastball away, felt like I rolled over it."
          className="mx-input w-full resize-none"
        />
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={run}
        disabled={submitting || planLimited}
        className="mx-btn mx-btn-accent w-full border-0"
      >
        <Sparkles className="h-4 w-4" />
        {submitting ? t("plan_ai_starting") : t("plan_ai_run")}
      </button>
      <p className="mt-2 text-center text-[0.68rem] text-[var(--mx-dimmer)]">
        {t("plan_ai_footer")}
      </p>
    </div>
  );
}
