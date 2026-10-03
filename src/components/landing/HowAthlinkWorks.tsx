"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  MessageSquare,
  Radar,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";
import { getPlanSpec } from "@/lib/platform-plans";
import { useLocale } from "@/lib/i18n/provider";
import { MARKET_TO_PLATFORM, signUpHref } from "@/lib/market-to-platform";
import { joinPathFor } from "@/lib/onboarding";
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
/**
 * Reveal each card as it enters the viewport so the Free → Pro line lands with
 * the step it belongs to, rather than all at once on load.
 */
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (older browsers, jsdom): show it rather than
    // leaving the Pro lines permanently hidden.
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return { ref, shown };
}

export function HowAthlinkWorks({
  audience = "athlete",
  id = "how-it-works",
  showCta = true,
}: HowAthlinkWorksProps) {
  const { t } = useLocale();
  const isCoach = audience === "coach";
  const { ref: sectionRef, shown } = useRevealOnScroll<HTMLElement>();
  const pro = getPlanSpec(audience, "pro");
  const free = getPlanSpec(audience, "free");

  const steps = isCoach
    ? [
        {
          icon: UserRound,
          label: t("how_coach_step_1_label"),
          title: t("how_coach_step_1_title"),
          desc: t("how_coach_step_1_desc"),
          pro: t("how_coach_step_1_pro"),
        },
        {
          icon: CalendarDays,
          label: t("how_coach_step_2_label"),
          title: t("how_coach_step_2_title"),
          desc: t("how_coach_step_2_desc"),
          pro: t("how_coach_step_2_pro"),
        },
        {
          icon: Radar,
          label: t("how_coach_step_3_label"),
          title: t("how_coach_step_3_title"),
          desc: t("how_coach_step_3_desc"),
          pro: t("how_coach_step_3_pro"),
        },
        {
          icon: CircleDollarSign,
          label: t("how_coach_step_4_label"),
          title: t("how_coach_step_4_title"),
          desc: t("how_coach_step_4_desc"),
          pro: t("how_coach_step_4_pro"),
        },
      ]
    : [
        /* Book → Message → Share → Breakdown */
        {
          icon: CalendarDays,
          label: t("how_step_1_label"),
          title: t("how_step_1_title"),
          desc: t("how_step_1_desc"),
          pro: t("how_step_1_pro"),
        },
        {
          icon: MessageSquare,
          label: t("how_step_2_label"),
          title: t("how_step_2_title"),
          desc: t("how_step_2_desc"),
          pro: t("how_step_2_pro"),
        },
        {
          icon: Video,
          label: t("how_step_3_label"),
          title: t("how_step_3_title"),
          desc: t("how_step_3_desc"),
          pro: t("how_step_3_pro"),
        },
        {
          icon: Activity,
          label: t("how_step_4_label"),
          title: t("how_step_4_title"),
          desc: t("how_step_4_desc"),
          pro: t("how_step_4_pro"),
        },
      ];

  const freeBreakdowns = free.limits.aiBreakdownsPerMonth;

  return (
    <section
      id={id}
      ref={sectionRef}
      className="how-works"
      data-audience={audience}
      data-shown={shown ? "true" : "false"}
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
                <p className="how-step-pro">
                  <span className="how-step-pro-tag">
                    <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                    Pro
                  </span>
                  {step.pro}
                </p>
                <span className="how-step-glow" aria-hidden />
              </article>
            );
          })}
        </div>

        <div className="how-pro-band">
          <div className="how-pro-copy">
            <span className="how-pro-eyebrow">{t("how_pro_eyebrow")}</span>
            <h3>{isCoach ? t("how_pro_coach_title") : t("how_pro_athlete_title")}</h3>
            <p>{isCoach ? t("how_pro_coach_body") : t("how_pro_athlete_body")}</p>
          </div>

          <div className="how-pro-meter" aria-hidden>
            <div className="how-pro-meter-row">
              <span className="how-pro-meter-label">{t("plan_free")}</span>
              <span className="how-pro-meter-value">
                {isCoach ? t("how_pro_coach_free_value") : String(freeBreakdowns ?? 0)}
              </span>
            </div>
            <div className="how-pro-meter-bar">
              <span className="how-pro-meter-fill" />
            </div>
            <div className="how-pro-meter-row how-pro-meter-row-pro">
              <span className="how-pro-meter-label">{t("plan_pro")}</span>
              <span className="how-pro-meter-value">{t("how_pro_unlimited")}</span>
            </div>
          </div>

          <div className="how-pro-price">
            <span className="how-pro-price-amount">${pro.priceUsdMonthly}</span>
            <span className="how-pro-price-unit">{t("how_pro_per_month")}</span>
            <Link
              href={signUpHref(joinPathFor(isCoach ? "coach" : "athlete"))}
              className="how-pro-cta"
            >
              {t("how_pro_cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={MARKET_TO_PLATFORM.pricing} className="how-pro-compare">
              {t("how_pro_compare")}
            </Link>
          </div>
        </div>

        {showCta && (
          <div className="how-works-foot">
            <Link
              href={signUpHref(joinPathFor(isCoach ? "coach" : "athlete"))}
              className="how-works-cta"
            >
              {isCoach ? t("journey_register_coach") : t("journey_register_athlete")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`${MARKET_TO_PLATFORM.hq}#app-tour`} className="how-works-cta-ghost">
              {t("how_nav_link")}
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
