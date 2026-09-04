"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, MessageSquare, Video } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import "./how-athlink-works.css";

type HowAthlinkWorksProps = {
  /** Anchor id so journey progress rails and hero CTAs can scroll here. */
  id?: string;
  /** Hide the trailing CTA row when the host page already ends with one. */
  showCta?: boolean;
};

/**
 * "How AthlinkPro works" — the four-step athlete loop (book, message, share,
 * AI breakdown). Shared by /for-athletes and the standalone /how-it-works page.
 */
export function HowAthlinkWorks({ id = "how-it-works", showCta = true }: HowAthlinkWorksProps) {
  const { t } = useLocale();

  const steps = [
    {
      icon: CalendarDays,
      label: t("how_step_1_label"),
      title: t("how_step_1_title"),
      desc: t("how_step_1_desc"),
    },
    {
      icon: MessageSquare,
      label: t("how_step_2_label"),
      title: t("how_step_2_title"),
      desc: t("how_step_2_desc"),
    },
    {
      icon: Video,
      label: t("how_step_3_label"),
      title: t("how_step_3_title"),
      desc: t("how_step_3_desc"),
    },
    {
      icon: BarChart3,
      label: t("how_step_4_label"),
      title: t("how_step_4_title"),
      desc: t("how_step_4_desc"),
    },
  ];

  return (
    <section id={id} className="how-works">
      <div className="how-works-wrap">
        <div className="how-works-head">
          <span className="how-works-eyebrow">{t("how_eyebrow")}</span>
          <h2>{t("how_title")}</h2>
          <p>{t("how_sub")}</p>
        </div>

        <div className="how-works-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.label} className="how-step">
                <div className="how-step-top">
                  <span className="how-step-ic">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="how-step-num" aria-hidden>
                    {index + 1}
                  </span>
                </div>
                <div className="how-step-label">{step.label}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            );
          })}
        </div>

        {showCta && (
          <div className="how-works-foot">
            <Link href="/join/athlete" className="how-works-cta">
              {t("how_cta_start")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/search" className="how-works-cta-ghost">
              {t("hq_browse_coaches")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
