"use client";

import { ClipboardList, Handshake, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";

/** Looping baseball pitch video — reused on coach and athlete marketing homepages. */
export function PitchingHeroVideo() {
  const { t } = useLocale();

  const steps = [
    { n: "1", icon: ClipboardList, title: t("land_how_1_title"), desc: t("land_how_1_desc") },
    { n: "2", icon: Handshake, title: t("land_how_2_title"), desc: t("land_how_2_desc") },
    { n: "3", icon: Sparkles, title: t("land_how_3_title"), desc: t("land_how_3_desc") },
  ];

  return (
    <section id="how" className="relative scroll-mt-24 overflow-hidden py-16 sm:py-20">
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
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="land-title-plate mx-auto max-w-2xl rounded-2xl px-4 py-5 text-center">
          <h2 className="font-brand text-3xl tracking-tight text-white drop-shadow-sm sm:text-4xl">
            {t("land_how_title")}
          </h2>
          <p className="mt-2 text-white/90 drop-shadow-sm">{t("land_how_sub")}</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/85 drop-shadow-sm">
            {t("hero_body")}
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.n}
                className="rounded-2xl border border-white/12 bg-white/10 p-6 backdrop-blur-md dark:border-white/15 dark:bg-black/25"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-black text-white">
                    {step.n}
                  </span>
                  <Icon className="h-5 w-5 text-sky-200" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{step.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
