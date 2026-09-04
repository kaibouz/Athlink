"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "athlink_intro_seen_v2";
const ENTRY_KEY = "athlink_site_entry_v1";
const EXIT_MS = 1200;
const REVEAL_MS = 180;

type Phase = "idle" | "playing" | "exiting" | "done";

function shouldPlayIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return false;
  } catch {
    /* ignore */
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

export function LandingSplash({
  onReveal,
  onFinished,
}: {
  /** Landing may start fading in under the splash */
  onReveal?: () => void;
  /** Splash fully gone */
  onFinished?: () => void;
}) {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
      sessionStorage.setItem(ENTRY_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("exiting");
    window.setTimeout(() => onReveal?.(), REVEAL_MS);
    window.setTimeout(() => {
      setPhase("done");
      onFinished?.();
    }, EXIT_MS);
  };

  useEffect(() => {
    if (!shouldPlayIntro()) {
      finishedRef.current = true;
      setPhase("done");
      onReveal?.();
      onFinished?.();
      return;
    }
    setPhase("playing");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only cinematic gate
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const play = async () => {
      try {
        video.currentTime = 0;
        await video.play();
      } catch {
        if (!cancelled) window.setTimeout(finish, 1600);
      }
    };
    void play();

    const safety = window.setTimeout(() => {
      if (!cancelled) finish();
    }, 6500);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      className={cn(
        "landing-splash fixed inset-0 z-[80] flex items-center justify-center bg-black",
        phase === "exiting" && "landing-splash-exit",
      )}
      role="dialog"
      aria-label={t("splash_aria")}
      aria-modal="true"
    >
      <div className="landing-splash-atmosphere" aria-hidden>
        <div className="landing-splash-rays" />
        <div className="landing-splash-particles" />
      </div>

      <div className="landing-splash-bloom" aria-hidden />

      <video
        ref={videoRef}
        className="landing-splash-video relative z-10 h-full w-full object-contain"
        muted
        playsInline
        preload="auto"
        poster="/brand/athlink-intro-poster.png"
        onEnded={finish}
        onError={() => window.setTimeout(finish, 800)}
      >
        <source src="/brand/athlink-logo-hd.mp4" type="video/mp4" />
        <source src="/brand/athlink-logo.mp4" type="video/mp4" />
        <source src="/videos/athlink-intro.mp4" type="video/mp4" />
      </video>

      <button
        type="button"
        className="landing-splash-skip absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 sm:right-6 sm:bottom-6"
        onClick={finish}
      >
        {t("splash_skip")}
      </button>
    </div>
  );
}
