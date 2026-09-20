"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { MARKET_TO_PLATFORM } from "@/lib/market-to-platform";
import "./how-it-works-walkthrough.css";

export type WalkRole = "athlete" | "coach";

type FrameDef = {
  src: string;
  labelKey: MessageKey;
  captionKey: MessageKey;
};

const ATHLETE_FRAMES: FrameDef[] = [
  {
    src: "/marketing/how-it-works/athlete-01.png",
    labelKey: "hiw_athlete_label_1",
    captionKey: "hiw_athlete_cap_1",
  },
  {
    src: "/marketing/how-it-works/athlete-02.png",
    labelKey: "hiw_athlete_label_2",
    captionKey: "hiw_athlete_cap_2",
  },
  {
    src: "/marketing/how-it-works/athlete-03.png",
    labelKey: "hiw_athlete_label_3",
    captionKey: "hiw_athlete_cap_3",
  },
  {
    src: "/marketing/how-it-works/athlete-04.png",
    labelKey: "hiw_athlete_label_4",
    captionKey: "hiw_athlete_cap_4",
  },
  {
    src: "/marketing/how-it-works/athlete-05.png",
    labelKey: "hiw_athlete_label_5",
    captionKey: "hiw_athlete_cap_5",
  },
  {
    src: "/marketing/how-it-works/athlete-06.png",
    labelKey: "hiw_athlete_label_6",
    captionKey: "hiw_athlete_cap_6",
  },
  {
    src: "/marketing/how-it-works/athlete-07.png",
    labelKey: "hiw_athlete_label_7",
    captionKey: "hiw_athlete_cap_7",
  },
  {
    src: "/marketing/how-it-works/athlete-08.png",
    labelKey: "hiw_athlete_label_8",
    captionKey: "hiw_athlete_cap_8",
  },
  {
    src: "/marketing/how-it-works/athlete-09.png",
    labelKey: "hiw_athlete_label_9",
    captionKey: "hiw_athlete_cap_9",
  },
];

const COACH_FRAMES: FrameDef[] = [
  {
    src: "/marketing/how-it-works/coach-01.png",
    labelKey: "hiw_coach_label_1",
    captionKey: "hiw_coach_cap_1",
  },
  {
    src: "/marketing/how-it-works/coach-02.png",
    labelKey: "hiw_coach_label_2",
    captionKey: "hiw_coach_cap_2",
  },
  {
    src: "/marketing/how-it-works/coach-03.png",
    labelKey: "hiw_coach_label_3",
    captionKey: "hiw_coach_cap_3",
  },
  {
    src: "/marketing/how-it-works/coach-04.png",
    labelKey: "hiw_coach_label_4",
    captionKey: "hiw_coach_cap_4",
  },
  {
    src: "/marketing/how-it-works/coach-05.png",
    labelKey: "hiw_coach_label_5",
    captionKey: "hiw_coach_cap_5",
  },
  {
    src: "/marketing/how-it-works/coach-06.png",
    labelKey: "hiw_coach_label_6",
    captionKey: "hiw_coach_cap_6",
  },
  {
    src: "/marketing/how-it-works/coach-07.png",
    labelKey: "hiw_coach_label_7",
    captionKey: "hiw_coach_cap_7",
  },
  {
    src: "/marketing/how-it-works/coach-08.png",
    labelKey: "hiw_coach_label_8",
    captionKey: "hiw_coach_cap_8",
  },
  {
    src: "/marketing/how-it-works/coach-09.png",
    labelKey: "hiw_coach_label_9",
    captionKey: "hiw_coach_cap_9",
  },
];

const ADVANCE_MS = 3400;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type HowItWorksAppWalkthroughProps = {
  id?: string;
  /** Initial role tab. */
  defaultRole?: WalkRole;
};

/**
 * Marketplace HQ How it works — animated Athlete | Coach app walkthrough
 * built from AthlinkPro mobile concept screens.
 */
export function HowItWorksAppWalkthrough({
  id = "how-it-works",
  defaultRole = "athlete",
}: HowItWorksAppWalkthroughProps) {
  const { t } = useLocale();
  const labelId = useId();
  const stageRef = useRef<HTMLDivElement>(null);

  const [role, setRole] = useState<WalkRole>(defaultRole);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const frames = role === "coach" ? COACH_FRAMES : ATHLETE_FRAMES;
  const frame = frames[index] ?? frames[0];
  const autoplayActive = playing && !hoverPaused && !reduceMotion;

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      const next = mq.matches;
      setReduceMotion(next);
      if (next) setPlaying(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [role]);

  useEffect(() => {
    if (!autoplayActive) return;
    const timer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [autoplayActive, index, frames.length]);

  const goTo = useCallback(
    (next: number) => {
      const len = frames.length;
      setIndex(((next % len) + len) % len);
    },
    [frames.length],
  );

  const switchRole = useCallback((next: WalkRole) => {
    setRole(next);
    setPlaying(!prefersReducedMotion());
  }, []);

  const onStageKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setPlaying(false);
    } else if (event.key === " " || event.key === "Enter") {
      if ((event.target as HTMLElement).closest("button, a")) return;
      event.preventDefault();
      setPlaying((p) => !p);
    } else if (event.key === "a" || event.key === "A") {
      switchRole("athlete");
    } else if (event.key === "c" || event.key === "C") {
      switchRole("coach");
    }
  };

  return (
    <section
      id={id}
      className="hiw-walk"
      data-role={role}
      aria-labelledby={labelId}
    >
      <div className="hiw-walk-wrap">
        <div className="hiw-walk-head">
          <span className="hiw-walk-eyebrow">{t("hiw_eyebrow")}</span>
          <h2 id={labelId}>{t("hiw_title")}</h2>
          <p>{t("hiw_sub")}</p>
        </div>

        <div
          className="hiw-role-toggle"
          role="tablist"
          aria-label={t("hiw_toggle_aria")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={role === "athlete"}
            className={role === "athlete" ? "is-active" : undefined}
            onClick={() => switchRole("athlete")}
          >
            {t("hiw_tab_athlete")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "coach"}
            className={role === "coach" ? "is-active" : undefined}
            onClick={() => switchRole("coach")}
          >
            {t("hiw_tab_coach")}
          </button>
        </div>

        <div
          ref={stageRef}
          className="hiw-stage"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={t("hiw_stage_aria")}
          onKeyDown={onStageKeyDown}
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onFocus={() => setHoverPaused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setHoverPaused(false);
            }
          }}
        >
          <div className="hiw-phone" aria-hidden={false}>
            <div className="hiw-phone-bezel">
              <div className="hiw-phone-screen">
                {frames.map((f, i) => (
                  <Image
                    key={f.src}
                    src={f.src}
                    alt={i === index ? t(f.captionKey) : ""}
                    width={520}
                    height={1105}
                    className={
                      i === index
                        ? "hiw-frame is-active"
                        : "hiw-frame"
                    }
                    priority={i === 0}
                    sizes="(max-width: 640px) 240px, 280px"
                  />
                ))}
              </div>
            </div>
            <span className="hiw-phone-glow" aria-hidden />
          </div>

          <div className="hiw-copy">
            <p className="hiw-frame-label">{t(frame.labelKey)}</p>
            <p className="hiw-frame-cap" aria-live="polite">
              {t(frame.captionKey)}
            </p>
            <p className="hiw-frame-count">
              {t("hiw_frame_of", {
                current: String(index + 1),
                total: String(frames.length),
              })}
            </p>

            <div className="hiw-controls">
              <button
                type="button"
                className="hiw-ctrl"
                aria-label={t("hiw_prev")}
                onClick={() => goTo(index - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="hiw-ctrl hiw-ctrl-play"
                aria-label={playing ? t("hiw_pause") : t("hiw_play")}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing && !reduceMotion ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                className="hiw-ctrl"
                aria-label={t("hiw_next")}
                onClick={() => goTo(index + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div
              className="hiw-dots"
              role="tablist"
              aria-label={t("hiw_dots_aria")}
            >
              {frames.map((f, i) => (
                <button
                  key={f.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={t(f.labelKey)}
                  className={i === index ? "is-active" : undefined}
                  onClick={() => {
                    setIndex(i);
                    setPlaying(false);
                  }}
                />
              ))}
            </div>

            {!reduceMotion && (
              <div
                className="hiw-progress"
                key={`${role}-${index}-${autoplayActive}`}
                data-active={autoplayActive ? "true" : "false"}
                aria-hidden
              />
            )}

            <p className="hiw-hint">{t("hiw_keyboard_hint")}</p>
          </div>
        </div>

        <div className="hiw-walk-foot">
          <Link href={MARKET_TO_PLATFORM.getStarted} className="hiw-walk-cta">
            {t("hq_get_started")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={MARKET_TO_PLATFORM.browse} className="hiw-walk-cta-ghost">
            {t("hq_browse_coaches")}
          </Link>
        </div>
      </div>
    </section>
  );
}
