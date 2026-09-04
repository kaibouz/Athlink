"use client";

import Link from "next/link";
import { Heart, MessageCircle, Sparkles, UserRound } from "lucide-react";
import type { SocialPost } from "@/types";

const TYPE_LABEL: Record<string, string> = {
  form: "Form",
  practice: "Practice",
  game: "Game",
  training: "Training",
  highlight: "Highlight",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Concept feed — one clip at a time, vertical snap, coach + session tags and breakdown chips. */
export function FeedViewer({ posts }: { posts: SocialPost[] }) {
  if (posts.length === 0) {
    return <div className="px-4 py-16 text-center text-[var(--mx-dim)]">No clips yet.</div>;
  }

  return (
    <div className="mx-feed">
      {posts.map((post) => (
        <section key={post.id} className="mx-feed-item">
          <video
            src={post.videoUrl}
            poster={post.posterUrl}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
            loop
            controls
          />
          <div className="mx-feed-scrim" />

          <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-4">
            <span className="mx-avatar">{initials(post.athleteName)}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">{post.athleteName}</div>
              <div className="truncate text-[0.72rem] text-white/70">
                {post.school} · {post.position} · {post.classYear}
              </div>
            </div>
            <span className="mx-pill mx-pill-grey ml-auto">{TYPE_LABEL[post.type] ?? post.type}</span>
          </div>

          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
            <p className="text-sm leading-snug text-white">{post.caption}</p>

            <div className="flex flex-wrap gap-2">
              {post.coachName && (
                <span className="mx-pill mx-pill-blue inline-flex items-center gap-1">
                  <UserRound className="h-3 w-3" /> {post.coachName}
                </span>
              )}
              {post.sessionLabel && <span className="mx-pill mx-pill-grey">{post.sessionLabel}</span>}
            </div>

            {post.metricChips && post.metricChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.metricChips.map((c) => (
                  <span key={c.label} className="mx-pill mx-pill-accent">
                    {c.label} {c.value}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 text-[0.75rem] text-white/80">
                <Heart className="h-4 w-4" /> {post.likes}
              </span>
              <span className="inline-flex items-center gap-1 text-[0.75rem] text-white/80">
                <MessageCircle className="h-4 w-4" /> Feedback
              </span>
              {post.breakdownId && (
                <Link
                  href={`/breakdown/${post.breakdownId}`}
                  className="mx-btn mx-btn-accent ml-auto border-0 text-[0.72rem]"
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI breakdown
                </Link>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
