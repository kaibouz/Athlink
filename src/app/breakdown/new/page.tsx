"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Upload, Video } from "lucide-react";
import { useAuth } from "@/lib/store";
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
  const { user, hydrated } = useAuth();

  const [selectedId, setSelectedId] = useState(CLIP_PRESETS[0].id);
  const [customUrl, setCustomUrl] = useState("");
  const [analysisType, setAnalysisType] = useState<ClipType>("swing");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const preset = CLIP_PRESETS.find((c) => c.id === selectedId);
  const usingCustom = selectedId === "custom";
  const clipUrl = usingCustom ? customUrl.trim() : preset?.url ?? "";
  const posterUrl = usingCustom ? undefined : preset?.poster;

  function pick(id: string, type?: ClipType) {
    setSelectedId(id);
    if (type) setAnalysisType(type);
  }

  async function run() {
    setError("");
    if (!clipUrl) {
      setError("Choose a sample clip or paste a video URL.");
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
      if (!res.ok) {
        setError(res.status === 403 ? "Only athletes can run an analysis." : "Could not start the analysis.");
        return;
      }
      const json = (await res.json()) as { breakdown?: AiBreakdown };
      if (json.breakdown?.id) {
        router.push(`/breakdown/${json.breakdown.id}`);
      } else {
        setError("Could not start the analysis.");
      }
    } catch {
      setError("Could not start the analysis.");
    } finally {
      setSubmitting(false);
    }
  }

  if (hydrated && (!user || user.role !== "athlete")) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold">AI analysis</h1>
        <p className="mt-2 text-[color:var(--mx-dim)]">Sign in as an athlete to analyze a clip.</p>
        <Link href="/home" className="mx-btn mx-btn-ghost mt-6 inline-flex">
          Back to home
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
            <h1 className="text-[1.15rem]">New AI analysis</h1>
            <small>Upload or pick a clip — get a pose + mechanics breakdown</small>
          </div>
        </div>
      </header>

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
        disabled={submitting}
        className="mx-btn mx-btn-accent w-full border-0"
      >
        <Sparkles className="h-4 w-4" />
        {submitting ? "Starting analysis…" : "Run AI analysis"}
      </button>
      <p className="mt-2 text-center text-[0.68rem] text-[var(--mx-dimmer)]">
        Runs on a configured vision model when available, otherwise the on-box AthLink Motion analyzer.
      </p>
    </div>
  );
}
