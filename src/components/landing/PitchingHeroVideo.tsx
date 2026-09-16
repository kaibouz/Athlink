"use client";

import { useLocale } from "@/lib/i18n/provider";

/**
 * Looping baseball pitch video — visual band for marketing pages.
 * How-it-works fork on market HQ via `<HowItWorksFork />`; detailed steps on role LPs.
 */
export function PitchingHeroVideo() {
  const { t } = useLocale();

  return (
    <section
      aria-label={t("land_how_title")}
      className="relative overflow-hidden py-16 sm:py-20"
    >
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/baseball-pitch.jpg"
        aria-hidden
      >
        <source src="/videos/baseball-pitch.mp4" type="video/mp4" />
      </video>
      <div className="land-video-wash absolute inset-0" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-[220px] max-w-6xl items-end px-4 sm:min-h-[280px] sm:px-6">
        <p className="max-w-lg text-sm font-medium tracking-wide text-white/90 drop-shadow-sm sm:text-base">
          {t("hero_body")}
        </p>
      </div>
    </section>
  );
}
