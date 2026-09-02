"use client";

import Link from "next/link";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { OnboardingBow } from "@/components/onboarding/OnboardingBow";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import type { MessageKey } from "@/lib/i18n/messages";
import { useLocale } from "@/lib/i18n/provider";
import type { OnboardingStep } from "@/lib/onboarding";
import { stepIndex, ONBOARDING_STEPS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const STEP_LABEL_KEYS: Record<Exclude<OnboardingStep, "welcome">, MessageKey> = {
  account: "onboard_step_account",
  intro: "onboard_step_intro",
  profile: "onboard_step_profile",
  details: "onboard_step_details",
  social: "onboard_step_social",
  finish: "onboard_step_finish",
};

export function OnboardingShell({
  step,
  children,
}: {
  step: OnboardingStep;
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  const current = stepIndex(step);
  const visibleSteps = ONBOARDING_STEPS.filter((s) => s !== "welcome");
  const isWelcome = step === "welcome";
  const isFinish = step === "finish";

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        isWelcome ? "onboarding-scene" : "bg-gradient-to-b from-brand-50/80 to-surface",
      )}
    >
      <header
        className={cn(
          "flex h-14 items-center justify-between gap-3 px-4 backdrop-blur-md sm:px-6",
          isWelcome
            ? "onboarding-scene-header border-b border-transparent"
            : "border-b border-brand-100/80 bg-surface/90",
        )}
      >
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white shadow-sm shadow-brand-600/30">
            A
          </span>
          <span className="text-lg">
            <AthLinkMark />
          </span>
        </Link>
        <LocaleSwitcher compact />
      </header>

      {!isWelcome && !isFinish && (
        <div className="border-b border-brand-100 bg-surface/60 px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-brand-500">
              <span>{t("onboard_progress")}</span>
              <span>
                {current + 1} / {ONBOARDING_STEPS.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-brand-600 transition-all duration-500"
                style={{ width: `${Math.max(8, (current / (ONBOARDING_STEPS.length - 1)) * 100)}%` }}
              />
            </div>
            <ol className="mt-3 hidden gap-2 sm:flex sm:flex-wrap">
              {visibleSteps.map((s) => {
                const idx = stepIndex(s);
                const done = idx < current;
                const active = s === step;
                return (
                  <li
                    key={s}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      active && "bg-brand-600 text-white shadow-sm",
                      done && !active && "bg-brand-100 text-brand-700",
                      !done && !active && "text-brand-400",
                    )}
                  >
                    {t(STEP_LABEL_KEYS[s])}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      <main
        className={cn(
          isWelcome
            ? "onboarding-welcome-main"
            : "mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10",
        )}
      >
        {children}
      </main>
    </div>
  );
}

export function OnboardingWelcomeHero({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="onboarding-bow-wrap">
        <OnboardingBow className="onboarding-bow-svg" />
      </div>
      <div className="onboarding-welcome-card">{children}</div>
    </>
  );
}
