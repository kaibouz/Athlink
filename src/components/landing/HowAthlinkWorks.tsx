"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  MessageSquare,
  Radar,
  Search,
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
 * Detailed How it works — step grid for athlete or coach.
 * Market HQ (`/`) shows the athlete intro with a link to the coach path.
 * Role LPs (`/for-athletes`, `/for-coaches`) keep their own audience section.
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
        {
          icon: Search,
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
          <span className="how-works-eyebrow">
            {isCoach ? t("how_coach_eyebrow") : t("how_eyebrow")}
          </span>
          <h2>{isCoach ? t("how_coach_title") : t("how_title")}</h2>
          <p>{isCoach ? t("how_coach_sub") : t("how_sub")}</p>
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
            <Link
              href={isCoach ? MARKET_TO_PLATFORM.joinCoach : MARKET_TO_PLATFORM.joinAthlete}
              className="how-works-cta"
            >
              {isCoach ? t("journey_register_coach") : t("journey_register_athlete")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={isCoach ? MARKET_TO_PLATFORM.forAthletes : MARKET_TO_PLATFORM.forCoaches}
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
