"use client";

import Link from "next/link";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import type { MessageKey } from "@/lib/i18n/messages";
import { useLocale } from "@/lib/i18n/provider";
import type { OnboardingStep } from "@/lib/onboarding";
import { ONBOARDING_WIZARD_STEPS, stepIndex } from "@/lib/onboarding";
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
  wizardMode = false,
  role,
}: {
  step: OnboardingStep;
  children: React.ReactNode;
  wizardMode?: boolean;
  role?: "coach" | "athlete";
}) {
  const { t } = useLocale();
  const steps = wizardMode ? ONBOARDING_WIZARD_STEPS : [];
  const current = wizardMode ? steps.indexOf(step as (typeof steps)[number]) : stepIndex(step);
  const total = wizardMode ? steps.length : 0;
  const isFinish = step === "finish";

  return (
    <div className={cn("onboarding-scene flex min-h-screen flex-col", role === "athlete" && "onboarding-scene-athlete")}>
      <header className="onboarding-scene-header flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur-md sm:px-6">
        <Link href="/join" className="inline-flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm",
              role === "coach" ? "bg-brand-600 shadow-brand-600/30" : "bg-amber-500 shadow-amber-500/30",
            )}
          >
            A
          </span>
          <span className="text-lg">
            <AthLinkMark />
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {role && (
            <span
              className={cn(
                "hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline",
                role === "coach"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-amber-100 text-amber-900",
              )}
            >
              {role === "coach" ? t("join_coach_badge") : t("join_athlete_badge")}
            </span>
          )}
          <LocaleSwitcher compact />
        </div>
      </header>

      {wizardMode && !isFinish && current >= 0 && (
        <div className="border-b border-brand-100 bg-surface/60 px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-brand-500">
              <span>{t("onboard_progress")}</span>
              <span>
                {current + 1} / {total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  role === "coach"
                    ? "bg-gradient-to-r from-cyan-500 to-brand-600"
                    : "bg-gradient-to-r from-amber-400 to-orange-500",
                )}
                style={{
                  width: `${Math.max(8, (current / Math.max(total - 1, 1)) * 100)}%`,
                }}
              />
            </div>
            <ol className="mt-3 hidden gap-2 sm:flex sm:flex-wrap">
              {steps.map((s) => {
                const idx = steps.indexOf(s);
                const done = idx < current;
                const active = s === step;
                return (
                  <li
                    key={s}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      active &&
                        (role === "coach"
                          ? "bg-brand-600 text-white shadow-sm"
                          : "bg-amber-500 text-white shadow-sm"),
                      done && !active && "bg-brand-100 text-brand-700",
                      !done && !active && "text-brand-400",
                    )}
                  >
                    {t(STEP_LABEL_KEYS[s as keyof typeof STEP_LABEL_KEYS])}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
