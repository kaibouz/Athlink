"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Ghost, Send, SquareActivity } from "lucide-react";
import type { AiBreakdown } from "@/types";
import { useAuth } from "@/lib/store";

/** Skeleton bones as pairs of joint indices (see athlete-data pose order). */
const BONES: [number, number][] = [
  [0, 1],
  [2, 3],
  [1, 2],
  [1, 3],
  [2, 4],
  [4, 6],
  [3, 5],
  [5, 7],
  [1, 8],
  [1, 9],
  [8, 9],
  [8, 10],
  [10, 12],
  [9, 11],
  [11, 13],
];

function Skeleton({ joints, color, dashed }: { joints: number[][]; color: string; dashed?: boolean }) {
  return (
    <g>
      {BONES.map(([a, b], i) => {
        const p1 = joints[a];
        const p2 = joints[b];
        if (!p1 || !p2) return null;
        return (
          <line
            key={i}
            x1={p1[0] * 100}
            y1={p1[1] * 100}
            x2={p2[0] * 100}
            y2={p2[1] * 100}
            stroke={color}
            strokeWidth={dashed ? 0.8 : 1.1}
            strokeDasharray={dashed ? "2 2" : undefined}
            strokeLinecap="round"
            opacity={dashed ? 0.7 : 1}
          />
        );
      })}
      {joints.map((p, i) => (
        <circle key={i} cx={p[0] * 100} cy={p[1] * 100} r={dashed ? 0.9 : 1.3} fill={color} opacity={dashed ? 0.7 : 1} />
      ))}
    </g>
  );
}

export function BreakdownViewer({ breakdown }: { breakdown: AiBreakdown }) {
  const router = useRouter();
  const { user } = useAuth();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showReference, setShowReference] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(breakdown.sentToCoach);
  const processing = breakdown.status !== "ready";
  const canSend = user?.role === "athlete" && user.id === breakdown.athleteId;

  async function sendToThread() {
    setSending(true);
    try {
      const res = await fetch(`/api/breakdowns/${breakdown.id}/send-to-thread`, { method: "POST" });
      if (res.ok) setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-app mx-auto max-w-2xl px-4 py-6 sm:px-6">
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
            <h1 className="text-[1.15rem]">{breakdown.title}</h1>
            <small>
              {breakdown.athleteName ?? "Athlete"}
              {breakdown.coachName ? ` · reviewed by ${breakdown.coachName}` : ""}
            </small>
          </div>
        </div>
      </header>

      <div className="relative mb-3 overflow-hidden rounded-2xl border border-[var(--mx-border-strong)] bg-black">
        <div className="relative aspect-video w-full">
          <video
            src={breakdown.videoUrl}
            poster={breakdown.posterUrl}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
          {(showSkeleton || showReference) && !processing && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden
            >
              {showReference && <Skeleton joints={breakdown.pose.ref} color="#8db0ff" dashed />}
              {showSkeleton && <Skeleton joints={breakdown.pose.user} color="var(--mx-accent)" />}
            </svg>
          )}
          {processing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
              <div className="mx-skel-bar h-2 w-32 overflow-hidden rounded-full">
                <span />
              </div>
              <p className="text-[0.75rem] text-white/80">Analyzing pose…</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 bg-[var(--mx-panel)] p-2">
          <button
            type="button"
            onClick={() => setShowSkeleton((v) => !v)}
            className={`mx-btn text-[0.72rem] ${showSkeleton ? "mx-btn-accent border-0" : "mx-btn-ghost"}`}
          >
            <SquareActivity className="h-3.5 w-3.5" /> Skeleton
          </button>
          <button
            type="button"
            onClick={() => setShowReference((v) => !v)}
            className={`mx-btn text-[0.72rem] ${showReference ? "mx-btn-accent border-0" : "mx-btn-ghost"}`}
          >
            <Ghost className="h-3.5 w-3.5" /> Reference model
          </button>
        </div>
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">Key metrics</div>
        <div className="flex flex-wrap gap-2">
          {breakdown.metrics.map((m) => (
            <span key={m.label} className="mx-pill mx-pill-accent inline-flex items-center gap-1">
              {m.label} {m.value}
              {m.delta ? <span className="text-[var(--mx-green)]">{m.delta}</span> : null}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">Flags</div>
        {breakdown.flags.map((f) => (
          <div key={f.label} className="mx-rank">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: f.severity === "warn" ? "var(--mx-amber)" : "var(--mx-green)" }}
            />
            <span className="min-w-0 flex-1">
              <b className="text-[0.8rem]">{f.label}</b>
              <span className="block text-[0.72rem] text-[var(--mx-dimmer)]">{f.note}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">Summary</div>
        <p className="text-sm leading-relaxed text-[var(--mx-text)]">{breakdown.summary}</p>
      </div>

      {canSend && (
        <button
          type="button"
          onClick={sendToThread}
          disabled={sending || sent}
          className={`mx-btn w-full border-0 ${sent ? "mx-btn-ghost" : "mx-btn-accent"}`}
        >
          {sent ? (
            <>
              <Check className="h-4 w-4" /> Sent to coach
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send report to coach thread"}
            </>
          )}
        </button>
      )}
      {sent && (
        <Link href="/messages" className="mx-btn mx-btn-ghost mt-2 w-full">
          Open thread
        </Link>
      )}
    </div>
  );
}
