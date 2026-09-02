"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Maximize2, Minus, Plus, X } from "lucide-react";
import {
  CA_REGIONS,
  mapEmbedUrl,
  mapsLinks,
  mapViewForRegion,
  type CaRegionId,
} from "@/lib/dashboard-analytics";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export type LessonRecord = {
  date: string;
  title: string;
  note?: string;
  region?: CaRegionId;
  bookingId?: string;
  format?: "in_person" | "online";
};

function RegionMapFrame({
  regionId,
  zoom,
  className,
  title,
}: {
  regionId: CaRegionId | null;
  zoom: number;
  className?: string;
  title: string;
}) {
  const view = useMemo(() => mapViewForRegion(regionId, zoom), [regionId, zoom]);
  const src = mapEmbedUrl(view.lat, view.lng, view.zoom);

  return (
    <iframe
      title={title}
      src={src}
      className={cn("w-full rounded-lg border border-brand-100 bg-brand-50", className)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

function MapDetail({
  regionId,
  records,
  counts,
}: {
  regionId: CaRegionId;
  records: LessonRecord[];
  counts: Record<CaRegionId, number>;
}) {
  const { t } = useLocale();
  const region = CA_REGIONS.find((r) => r.id === regionId)!;
  const links = mapsLinks(regionId);
  const regionRecords = records.filter((r) => r.region === regionId);

  return (
    <div className="rounded-xl border border-brand-100 bg-surface p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-brand-950">{region.label}</p>
          <p className="text-xs text-brand-500">
            {t("records_map_lessons_in", { n: counts[regionId] })}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <a
            href={links.google}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
          >
            <ExternalLink className="h-3 w-3" />
            Google
          </a>
          <a
            href={links.apple}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
          >
            <ExternalLink className="h-3 w-3" />
            Apple
          </a>
        </div>
      </div>
      {regionRecords.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {regionRecords.map((r) => (
            <li key={`${r.date}-${r.title}`} className="rounded-lg bg-brand-50/60 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold text-brand-400">{r.date}</p>
              <p className="text-xs font-medium text-brand-900">{r.title}</p>
              {r.note && <p className="text-[11px] text-brand-600">{r.note}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-brand-500">{t("records_map_select_hint")}</p>
      )}
    </div>
  );
}

function RegionPills({
  counts,
  selected,
  onSelect,
  compact = false,
}: {
  counts: Record<CaRegionId, number>;
  selected: CaRegionId | null;
  onSelect: (id: CaRegionId) => void;
  compact?: boolean;
}) {
  const activeRegions = CA_REGIONS.filter((r) => counts[r.id] > 0);
  if (activeRegions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", compact ? "mt-1.5" : "mt-3")}>
      {activeRegions.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onSelect(r.id)}
          className={cn(
            "rounded-full font-semibold transition",
            compact
              ? "px-1.5 py-0.5 text-[9px]"
              : "px-2.5 py-1 text-xs",
            selected === r.id
              ? "bg-brand-900 text-white"
              : "bg-brand-50 text-brand-700 hover:bg-brand-100",
          )}
        >
          {compact ? r.label.split(" ")[0] : `${r.label} (${counts[r.id]})`}
        </button>
      ))}
    </div>
  );
}

export function LessonRegionMap({
  counts,
  max: _max,
  regionHint,
  records,
  selected: selectedProp,
  onSelectedChange,
  embedded = false,
}: {
  counts: Record<CaRegionId, number>;
  max: number;
  regionHint?: CaRegionId;
  records: LessonRecord[];
  selected?: CaRegionId | null;
  onSelectedChange?: (id: CaRegionId | null) => void;
  /** Map + pills only — detail lives in parent panel */
  embedded?: boolean;
}) {
  const { t } = useLocale();
  const [selectedInternal, setSelectedInternal] = useState<CaRegionId | null>(
    regionHint ?? null,
  );
  const selected = selectedProp !== undefined ? selectedProp : selectedInternal;
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(6);

  const initialRegion = useMemo(
    () => regionHint ?? CA_REGIONS.find((r) => counts[r.id] > 0)?.id ?? "la",
    [counts, regionHint],
  );

  function selectRegion(id: CaRegionId) {
    const next = selected === id ? null : id;
    if (onSelectedChange) onSelectedChange(next);
    else setSelectedInternal(next);
    if (next) setZoom(9);
  }

  function zoomIn() {
    setZoom((z) => Math.min(14, z + 1));
  }

  function zoomOut() {
    setZoom((z) => Math.max(5, z - 1));
  }

  const activeRegion = selected ?? initialRegion;
  const mapRegion = selected ?? initialRegion;
  const mapTitle = t("records_mini_map");

  return (
    <>
      <div className={cn("rounded-xl bg-brand-50/80 p-2", embedded && "rounded-none bg-transparent p-0")}>
        <div className="mb-1 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 uppercase">
            <span>{t("records_mini_map")}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={zoomOut}
              className="rounded-md p-1 text-brand-500 hover:bg-brand-100"
              aria-label={t("records_map_zoom_out")}
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="rounded-md p-1 text-brand-500 hover:bg-brand-100"
              aria-label={t("records_map_zoom_in")}
            >
              <Plus className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                if (!selected) selectRegion(initialRegion);
              }}
              className="rounded-md p-1 text-brand-500 hover:bg-brand-100"
              aria-label={t("records_map_expand")}
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        <RegionMapFrame
          regionId={mapRegion}
          zoom={zoom}
          className={embedded ? "h-44 sm:h-52" : "h-36"}
          title={mapTitle}
        />

        <RegionPills
          counts={counts}
          selected={selected}
          onSelect={selectRegion}
          compact
        />

        {!embedded && selected && (
          <div className="mt-2">
            <MapDetail regionId={selected} records={records} counts={counts} />
          </div>
        )}
      </div>

      {!embedded && expanded && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label={mapTitle}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-brand-950">{t("records_map_expand")}</h3>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg p-1.5 text-brand-500 hover:bg-brand-50"
                aria-label={t("records_map_close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={zoomOut}
                className="rounded-lg border border-brand-100 px-2 py-1 text-xs font-semibold text-brand-600"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="rounded-lg border border-brand-100 px-2 py-1 text-xs font-semibold text-brand-600"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <RegionMapFrame
              regionId={mapRegion}
              zoom={zoom}
              className="mt-2 h-64 sm:h-72"
              title={mapTitle}
            />

            <RegionPills counts={counts} selected={selected} onSelect={selectRegion} />

            <MapDetail regionId={activeRegion} records={records} counts={counts} />
          </div>
        </div>
      )}
    </>
  );
}
