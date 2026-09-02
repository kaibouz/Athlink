"use client";

import { Suspense, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { defaultFilters, filterCoaches } from "@/lib/search";
import type { SearchFilters } from "@/types";
import { CoachCard } from "@/components/coaches/CoachCard";
import { SearchFiltersPanel } from "@/components/coaches/SearchFiltersPanel";
import { useLocale } from "@/lib/i18n/provider";
import { CommSwitcher } from "@/components/layout/CommSwitcher";
import { PageContainer, PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

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
  }));
  const results = useMemo(() => filterCoaches(filters), [filters]);

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

  return (
    <PageContainer wide>
      {user?.role === "coach" && <CommSwitcher />}
      <PageHeader
        title={t("search_title")}
        description={t("search_sub")}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {filtersOpen ? t("search_hide_filters") : t("search_show_filters")}
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside
          className={cn(
            "lg:sticky lg:top-6 lg:self-start",
            filtersOpen ? "block" : "hidden lg:block",
          )}
        >
          <SearchFiltersPanel
            filters={filters}
            onChange={setFilters}
            resultCount={results.length}
          />
        </aside>

        <div>
          <p className="mb-4 text-sm font-medium text-brand-600 lg:hidden">
            {t("search_results", { n: results.length })}
          </p>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-surface/80 p-12 text-center">
              <p className="font-medium text-brand-800">{t("search_empty")}</p>
              <p className="mt-1 text-sm text-brand-500">{t("search_empty_hint")}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {results.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default function SearchPage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div className="p-8 text-center text-brand-500">{t("loading")}</div>}>
      <SearchContent />
    </Suspense>
  );
}
