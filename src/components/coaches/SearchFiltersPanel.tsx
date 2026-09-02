"use client";

import type { SearchFilters } from "@/types";
import { LANGUAGES, LOCATIONS, SPECIALTIES, SPORTS } from "@/lib/data";
import { defaultFilters } from "@/lib/search";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { languageLabel, specialtyLabel, sportLabel } from "@/lib/i18n/localize";
import { Input, Label, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export function SearchFiltersPanel({
  filters,
  onChange,
  resultCount,
}: {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  resultCount: number;
}) {
  const { t } = useLocale();
  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Card>
      <CardBody className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-brand-950">{t("search_filters")}</h2>
        <span className="text-sm text-brand-500">
          {t("search_results", { n: resultCount })}
        </span>
      </div>

      <div>
        <Label htmlFor="q">{t("search_keyword")}</Label>
        <Input
          id="q"
          placeholder={t("search_keyword_ph")}
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="sport">{t("search_sport")}</Label>
        <Select id="sport" value={filters.sport} onChange={(e) => set("sport", e.target.value)}>
          <option value="">{t("search_all")}</option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {sportLabel(t, s)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="location">{t("search_location")}</Label>
        <Select
          id="location"
          value={filters.location}
          onChange={(e) => set("location", e.target.value)}
        >
          <option value="">{t("search_all")}</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="language">{t("search_language")}</Label>
        <Select
          id="language"
          value={filters.language}
          onChange={(e) => set("language", e.target.value)}
        >
          <option value="">{t("search_all")}</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {languageLabel(t, l)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="specialty">{t("search_specialty")}</Label>
        <Select
          id="specialty"
          value={filters.specialty}
          onChange={(e) => set("specialty", e.target.value)}
        >
          <option value="">{t("search_all")}</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {specialtyLabel(t, s)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="format">{t("search_format")}</Label>
        <Select
          id="format"
          value={filters.format}
          onChange={(e) => set("format", e.target.value as SearchFilters["format"])}
        >
          <option value="">{t("search_all")}</option>
          <option value="in_person">{t("search_in_person")}</option>
          <option value="online">{t("search_online")}</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="sort">{t("search_sort")}</Label>
        <Select
          id="sort"
          value={filters.sortBy}
          onChange={(e) => set("sortBy", e.target.value as SearchFilters["sortBy"])}
        >
          <option value="rating">{t("search_sort_rating")}</option>
          <option value="reviews">{t("search_sort_reviews")}</option>
          <option value="price_asc">{t("search_sort_price_asc")}</option>
          <option value="price_desc">{t("search_sort_price_desc")}</option>
        </Select>
      </div>
      <div>
        <Label>
          {t("search_max_price", { price: formatPrice(filters.maxPrice) })}
        </Label>
        <input
          type="range"
          min={40}
          max={200}
          step={5}
          value={filters.maxPrice}
          onChange={(e) => set("maxPrice", Number(e.target.value))}
          className="mt-2 w-full accent-brand-600"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-800">
        <input
          type="checkbox"
          checked={filters.verifiedOnly}
          onChange={(e) => set("verifiedOnly", e.target.checked)}
          className="h-4 w-4 rounded accent-brand-600"
        />
        {t("search_verified_only")}
      </label>
      <Button variant="outline" className="w-full" onClick={() => onChange({ ...defaultFilters })}>
        {t("search_clear")}
      </Button>
      </CardBody>
    </Card>
  );
}
