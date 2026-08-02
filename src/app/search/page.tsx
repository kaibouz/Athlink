"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { defaultFilters, filterCoaches } from "@/lib/search";
import type { SearchFilters } from "@/types";
import { CoachCard } from "@/components/coaches/CoachCard";
import { SearchFiltersPanel } from "@/components/coaches/SearchFiltersPanel";
import { useLocale } from "@/lib/i18n/provider";
import { CommSwitcher } from "@/components/layout/CommSwitcher";
import { useAuth } from "@/lib/store";

function SearchContent() {
  const { t } = useLocale();
  const { user } = useAuth();
  const params = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...defaultFilters,
    query: params.get("q") ?? "",
    sport: params.get("sport") ?? "",
    location: params.get("location") ?? "",
    language: params.get("language") ?? "",
  }));
  const results = useMemo(() => filterCoaches(filters), [filters]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {user?.role === "coach" && <CommSwitcher />}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950 sm:text-3xl">{t("search_title")}</h1>
        <p className="mt-1 text-brand-600">{t("search_sub")}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <SearchFiltersPanel
            filters={filters}
            onChange={setFilters}
            resultCount={results.length}
          />
        </aside>
        <div>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-surface p-12 text-center">
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
    </div>
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
