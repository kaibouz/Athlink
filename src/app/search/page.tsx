"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { SPECIALTIES } from "@/lib/data";
import { defaultFilters, filterCoaches } from "@/lib/search";
import type { CoachProfile, SearchFilters } from "@/types";
import { CoachBookCard } from "@/components/coaches/CoachBookCard";
import { SearchFiltersPanel } from "@/components/coaches/SearchFiltersPanel";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel } from "@/lib/i18n/localize";
import { CommSwitcher } from "@/components/layout/CommSwitcher";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

const BANNER_ROTATION = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;

function SearchContent() {
  const { t } = useLocale();
  const { user } = useAuth();
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...defaultFilters,
    query: params.get("q") ?? "",
    sport: params.get("sport") ?? "",
    location: params.get("location") ?? "",
    language: params.get("language") ?? "",
    specialty: params.get("specialty") ?? "",
  }));
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);

  useEffect(() => {
    void fetch("/api/coaches")
      .then((r) => r.json())
      .then((d: { coaches: CoachProfile[] }) => setCoaches(d.coaches ?? []))
      .catch(() => setCoaches([]));
  }, []);

  const results = useMemo(() => filterCoaches(filters, coaches), [filters, coaches]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.query) n++;
    if (filters.sport) n++;
    if (filters.location) n++;
    if (filters.language) n++;
    if (filters.specialty) n++;
    if (filters.format) n++;
    if (filters.verifiedOnly) n++;
    if (filters.maxPrice < defaultFilters.maxPrice) n++;
    if (filters.sortBy !== defaultFilters.sortBy) n++;
    return n;
  }, [filters]);

  function setSpecialty(specialty: string) {
    setFilters((prev) => ({ ...prev, specialty }));
  }

  return (
    <div className="mx-app mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {user?.role === "coach" && <CommSwitcher />}

      <header className="mx-hdr">
        <div>
          <h1>{t("nav_book")}</h1>
          <small>{t("search_sub")}</small>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden border-[color:var(--mx-border-strong)] bg-transparent text-[color:var(--mx-text)]"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filtersOpen ? t("search_hide_filters") : t("search_show_filters")}
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[color:var(--mx-blue-1)] px-1.5 py-0.5 text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </header>

      <div className="mb-4">
        <input
          className="mx-search"
          placeholder={t("search_keyword_ph")}
          value={filters.query}
          onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
        />
      </div>

      <div className="mx-chip-row mb-5">
        <button
          type="button"
          className={cn("mx-chip", !filters.specialty && "mx-chip-on")}
          onClick={() => setSpecialty("")}
        >
          {t("search_skill_all")}
        </button>
        {SPECIALTIES.map((id) => (
          <button
            key={id}
            type="button"
            className={cn("mx-chip", filters.specialty === id && "mx-chip-on")}
            onClick={() => setSpecialty(filters.specialty === id ? "" : id)}
          >
            {specialtyLabel(t, id)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside
          className={cn(
            "lg:sticky lg:top-6 lg:self-start",
            filtersOpen ? "block" : "hidden lg:block",
          )}
        >
          <div className="mx-card !p-0 overflow-hidden">
            <SearchFiltersPanel
              filters={filters}
              onChange={setFilters}
              resultCount={results.length}
            />
          </div>
        </aside>

        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-[color:var(--mx-text)]">
              {t("search_verified_count", { n: results.length })}
            </p>
            <p className="text-xs text-[color:var(--mx-dimmer)]">{t("search_sort_nearest")}</p>
          </div>
          {results.length === 0 ? (
            <div className="mx-card border-dashed text-center">
              <p className="font-medium">{t("search_empty")}</p>
              <p className="mt-1 text-sm text-[color:var(--mx-dimmer)]">{t("search_empty_hint")}</p>
            </div>
          ) : (
            <div className="mx-cgrid">
              {results.map((coach, i) => (
                <CoachBookCard
                  key={coach.id}
                  coach={coach}
                  bannerClass={BANNER_ROTATION[i % BANNER_ROTATION.length]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div className="mx-app p-8 text-center text-[color:var(--mx-dim)]">{t("loading")}</div>}>
      <SearchContent />
    </Suspense>
  );
}
