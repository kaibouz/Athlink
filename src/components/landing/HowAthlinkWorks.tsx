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
  Users,
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
 * Role-specific How it works — athlete and coach each own one detailed section
 * on their LP (`/for-athletes`, `/for-coaches`). HQ only links here; do not
 * duplicate this block on `/` or a third `/how-it-works` page.
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

/** HQ-only teaser: pick a side, then read the detailed loop on that LP. */
export function HowItWorksFork({ id = "how-it-works" }: { id?: string }) {
  const { t } = useLocale();

  return (
    <section id={id} className="how-works">
      <div className="how-works-wrap">
        <div className="how-works-head">
          <span className="how-works-eyebrow">{t("how_fork_eyebrow")}</span>
          <h2>{t("how_fork_title")}</h2>
          <p>{t("how_fork_sub")}</p>
        </div>

        <div className="how-works-fork-grid">
          <Link
            href={`${MARKET_TO_PLATFORM.forAthletes}#how-it-works`}
            className="how-works-fork-card how-works-fork-athlete"
          >
            <Users className="h-7 w-7" />
            <h3>{t("how_fork_athlete_title")}</h3>
            <p>{t("how_fork_athlete_body")}</p>
            <span className="how-works-fork-cta">
              {t("how_fork_athlete_cta")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href={`${MARKET_TO_PLATFORM.forCoaches}#how-it-works`}
            className="how-works-fork-card how-works-fork-coach"
          >
            <UserRound className="h-7 w-7" />
            <h3>{t("how_fork_coach_title")}</h3>
            <p>{t("how_fork_coach_body")}</p>
            <span className="how-works-fork-cta">
              {t("how_fork_coach_cta")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
