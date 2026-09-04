import type { MessageKey } from "@/lib/i18n/messages";

export type BreakdownFlag = "good" | "low" | "fix";

export type BreakdownMetric = {
  id: string;
  labelKey: MessageKey;
  value: string;
  flag: BreakdownFlag;
  flagKey: MessageKey;
  hintKey?: MessageKey;
};

/** Demo report matching AthlinkPro concept “AI breakdown” screen */
export const DEMO_BREAKDOWN = {
  id: "bd-sep2",
  titleKey: "bd_title" as const satisfies MessageKey,
  subtitleKey: "bd_subtitle" as const satisfies MessageKey,
  processedInSec: 44,
  clipLabel: "swing_0902.mov · 6s",
  sessionLabel: "vs Chris Alvarez · Sep 2",
  metrics: [
    {
      id: "hip",
      labelKey: "bd_metric_hip",
      value: "38°",
      flag: "low" as const,
      flagKey: "bd_flag_low",
      hintKey: "bd_hint_hip",
    },
    {
      id: "hand",
      labelKey: "bd_metric_hand",
      value: "+40ms",
      flag: "fix" as const,
      flagKey: "bd_flag_fix",
      hintKey: "bd_hint_hand",
    },
    {
      id: "ttc",
      labelKey: "bd_metric_ttc",
      value: "0.16s",
      flag: "good" as const,
      flagKey: "bd_flag_good",
    },
    {
      id: "attack",
      labelKey: "bd_metric_attack",
      value: "+9°",
      flag: "good" as const,
      flagKey: "bd_flag_good",
    },
  ] satisfies BreakdownMetric[],
  coachRefNoteKey: "bd_coach_ref" as const satisfies MessageKey,
};
