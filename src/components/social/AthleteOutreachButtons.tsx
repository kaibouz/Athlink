"use client";

import { Check, MessageSquare, Radar } from "lucide-react";
import { useScout } from "@/lib/scout-store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function AthleteOutreachButtons({
  athleteId,
  athleteName,
  email,
  openToScouts = true,
  size = "sm",
  className,
}: {
  athleteId: string;
  athleteName: string;
  email?: string;
  openToScouts?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t } = useLocale();
  const { contactAthlete, scoutAthlete, hasContacted, hasScouted } = useScout();
  const contacted = hasContacted(athleteId);
  const scouted = hasScouted(athleteId);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        type="button"
        size={size}
        variant={contacted ? "secondary" : "primary"}
        onClick={() => contactAthlete(athleteId, athleteName, email)}
        aria-label={t("social_contact_player")}
      >
        {contacted ? <Check className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
        {contacted ? t("social_contacted") : t("social_contact_1tap")}
      </Button>
      <Button
        type="button"
        size={size}
        variant={scouted ? "secondary" : "outline"}
        disabled={!openToScouts && !scouted}
        onClick={() => scoutAthlete(athleteId, athleteName)}
        aria-label={t("social_scout_player")}
        title={!openToScouts ? t("social_scout_closed") : undefined}
      >
        {scouted ? <Check className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
        {scouted ? t("social_scouted") : t("social_scout_1tap")}
      </Button>
    </div>
  );
}
