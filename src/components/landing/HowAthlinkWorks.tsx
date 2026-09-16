"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  MessageSquare,
  Radar,
  UserRound,
  Video,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { MARKET_TO_PLATFORM } from "@/lib/market-to-platform";
import "./how-athlink-works.css";

export type HowWorksAudience = "athlete" | "coach";

type HowAthlinkWorksProps = {
  audience?: HowWorksAudience;
  /** Anchor id so journey rails and role CTAs can scroll here. */
  id?: string;
  /** Hide trailing CTAs when the host page already ends with one. */
  showCta?: boolean;
};

/**
 * Detailed How it works steps — owned by marketplace HQ `/` (blue glass).
 * Coach LP reuses with audience="coach". Athlete LP should use
 * {@link HowItWorksHqTeaser} instead of duplicating this grid.
 */
export function HowAthlinkWorks({
  audience = "athlete",
  id = "how-it-works",
  showCta = true,
}: HowAthlinkWorksProps) {
  const { t } = useLocale();
  const isCoach = audience === "coach";

  const steps = isCoach
    ? [
        {
          icon: UserRound,
          label: t("how_coach_step_1_label"),
          title: t("how_coach_step_1_title"),
          desc: t("how_coach_step_1_desc"),
        },
        {
          icon: CalendarDays,
          label: t("how_coach_step_2_label"),
          title: t("how_coach_step_2_title"),
          desc: t("how_coach_step_2_desc"),
        },
        {
          icon: Radar,
          label: t("how_coach_step_3_label"),
          title: t("how_coach_step_3_title"),
          desc: t("how_coach_step_3_desc"),
        },
        {
          icon: CircleDollarSign,
          label: t("how_coach_step_4_label"),
          title: t("how_coach_step_4_title"),
          desc: t("how_coach_step_4_desc"),
        },
      ]
    : [
        /* Book → Message → Share → Breakdown */
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
          icon: Activity,
          label: t("how_step_4_label"),
          title: t("how_step_4_title"),
          desc: t("how_step_4_desc"),
        },
      ];

  return (
    <section
      id={id}
      className="how-works"
      data-audience={audience}
    >
      <div className="how-works-wrap">
        <div className="how-works-head">
          <span className="how-works-eyebrow">
            {isCoach ? t("how_coach_eyebrow") : t("how_eyebrow")}
          </span>
          <h2>{isCoach ? t("how_coach_title") : t("how_title")}</h2>
          <p>{isCoach ? t("how_coach_sub") : t("how_sub")}</p>
        </div>

        <div className="how-works-grid" role="list">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.label}
                className="how-step"
                role="listitem"
                style={{ ["--how-step-i" as string]: index }}
              >
                <div className="how-step-top">
                  <span className="how-step-ic" aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="how-step-num" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="how-step-label">{step.label}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <span className="how-step-glow" aria-hidden />
              </article>
            );
          })}
        </div>

        {showCta && (
          <div className="how-works-foot">
            <Link
              href={isCoach ? MARKET_TO_PLATFORM.joinCoach : MARKET_TO_PLATFORM.joinAthlete}
              className="how-works-cta"
            >
              {isCoach ? t("journey_register_coach") : t("journey_register_athlete")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={
                isCoach
                  ? `${MARKET_TO_PLATFORM.hq}#how-it-works`
                  : `${MARKET_TO_PLATFORM.forCoaches}#how-it-works`
              }
              className="how-works-cta-ghost"
            >
              {isCoach ? t("how_athlete_link") : t("how_coach_link")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Thin role-LP pointer to the detailed blue How it works on market HQ.
 * Keeps journey-rail `#how-it-works` without duplicating the step grid.
 */
export function HowItWorksHqTeaser({ id = "how-it-works" }: { id?: string }) {
  const { t } = useLocale();

  return (
    <section id={id} className="how-works how-works-teaser" data-audience="athlete">
      <div className="how-works-wrap">
        <div className="how-works-head">
          <span className="how-works-eyebrow">{t("how_teaser_eyebrow")}</span>
          <h2>{t("how_teaser_title")}</h2>
          <p>{t("how_teaser_sub")}</p>
          <Link
            href={`${MARKET_TO_PLATFORM.hq}#how-it-works`}
            className="how-works-teaser-cta"
          >
            {t("how_teaser_cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
