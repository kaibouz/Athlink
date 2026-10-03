"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { CoachBookRow } from "@/components/coaches/CoachBookRow";
import {
  CA_MAP_CENTER,
  CA_REGIONS,
  mapEmbedUrl,
  mapsLinks,
  REGION_GEO,
  type CaRegionId,
} from "@/lib/dashboard-analytics";
import { regionFromCoachLocation } from "@/lib/lesson-venues";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { CoachProfile, NextSlot } from "@/types";

/**
 * Deck "Map view" for the coach list: region pills carry the coach count, the
 * embed follows the selection, and the rows below stay the same component the
 * list view uses so a coach never renders two different ways.
 */
export function CoachMapView({
  coaches,
  nextSlots,
}: {
  coaches: CoachProfile[];
  nextSlots: Record<string, NextSlot | undefined>;
}) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<CaRegionId | null>(null);

  const byRegion = useMemo(() => {
    const map = {} as Record<CaRegionId, CoachProfile[]>;
    for (const region of CA_REGIONS) map[region.id] = [];
    for (const coach of coaches) {
      map[regionFromCoachLocation(coach.location)].push(coach);
    }
    return map;
  }, [coaches]);

  const regionsWithCoaches = CA_REGIONS.filter((r) => byRegion[r.id].length > 0);
  const active = selected ?? regionsWithCoaches[0]?.id ?? null;
  const view = active
    ? { ...REGION_GEO[active], zoom: 9 }
    : { ...CA_MAP_CENTER, label: "California" };
  const shown = active ? byRegion[active] : coaches;

  return (
    <div className="space-y-3">
      <div className="mx-card overflow-hidden !p-0">
        <iframe
          key={`${view.lat},${view.lng}`}
          src={mapEmbedUrl(view.lat, view.lng, view.zoom)}
          title={t("search_map_title")}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-64 w-full border-0 sm:h-80"
        />
      </div>

      <div className="mx-chip-row">
        {regionsWithCoaches.map((region) => (
          <button
            key={region.id}
            type="button"
            aria-pressed={active === region.id}
            onClick={() => setSelected(active === region.id ? null : region.id)}
            className={cn("mx-chip", active === region.id && "mx-chip-on")}
          >
            {region.label}
            <span className="ml-1.5 opacity-70">{byRegion[region.id].length}</span>
          </button>
        ))}
      </div>

      {active ? (
        <a
          href={mapsLinks(active).google}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[color:var(--mx-blue-2)] hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("search_map_open_external")}
        </a>
      ) : null}

      <div className="space-y-2">
        {shown.map((coach) => (
          <CoachBookRow key={coach.id} coach={coach} nextSlot={nextSlots[coach.id]} />
        ))}
      </div>
    </div>
  );
}
