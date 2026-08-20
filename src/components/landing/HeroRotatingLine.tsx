"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const WORD_KEYS = [
  "hero_word_coach",
  "hero_word_player",
  "hero_word_results",
  "hero_word_match",
  "hero_word_game",
] as const satisfies readonly MessageKey[];

const CHAR_STAGGER_MS = 42;
const EXIT_BASE_MS = 280;
const HOLD_MS = 2800;

export function HeroRotatingLine({ className }: { className?: string }) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let exitTimer = 0;
    const id = window.setInterval(() => {
      setPhase("out");
      const currentLen = Array.from(t(WORD_KEYS[indexRef.current])).length;
      const exitMs = EXIT_BASE_MS + currentLen * CHAR_STAGGER_MS * 0.55;
      window.clearTimeout(exitTimer);
      exitTimer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % WORD_KEYS.length);
        setPhase("in");
      }, exitMs);
    }, HOLD_MS);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(exitTimer);
    };
  }, [t]);

  const word = t(WORD_KEYS[index]);
  const chars = Array.from(word);

  return (
    <p
      className={cn(
        "land-rotate-line mx-auto flex flex-wrap items-baseline justify-center gap-x-2.5 text-[0.95rem] leading-snug text-brand-600 sm:text-lg",
        className,
      )}
    >
      <span className="land-rotate-prefix font-medium tracking-wide">
        {t("hero_developing")}
      </span>
      <span className="land-rotate-slot relative inline-flex min-w-[8ch] justify-center sm:min-w-[9.5ch]">
        <span
          className="land-rotate-word font-brand"
          aria-live="polite"
          aria-label={word}
        >
          {chars.map((char, i) => (
            <span
              key={`${WORD_KEYS[index]}-${i}-${char}`}
              className={cn(
                "land-rotate-char",
                phase === "in" ? "land-rotate-char-in" : "land-rotate-char-out",
              )}
              style={{
                animationDelay:
                  phase === "in"
                    ? `${i * CHAR_STAGGER_MS}ms`
                    : `${(chars.length - 1 - i) * CHAR_STAGGER_MS * 0.55}ms`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        <span className="land-rotate-rule" aria-hidden>
          <span
            key={`rule-${WORD_KEYS[index]}-${phase}`}
            className={cn(
              "land-rotate-rule-fill",
              phase === "out" && "land-rotate-rule-out",
            )}
          />
        </span>
      </span>
    </p>
  );
}
