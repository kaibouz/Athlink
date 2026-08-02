import type { CoachProfile, SearchFilters } from "@/types";
import { coaches } from "@/lib/data";

export const defaultFilters: SearchFilters = {
  query: "",
  sport: "",
  location: "",
  specialty: "",
  language: "",
  format: "",
  minPrice: 0,
  maxPrice: 200,
  verifiedOnly: false,
  sortBy: "rating",
};

export function filterCoaches(
  filters: SearchFilters,
  source: CoachProfile[] = coaches,
): CoachProfile[] {
  const result = source.filter((c) => {
    const q = filters.query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.bio.toLowerCase().includes(q) ||
      c.specialties.some((s) => s.toLowerCase().includes(q)) ||
      c.location.toLowerCase().includes(q) ||
      c.languages.some((l) => l.toLowerCase().includes(q));
    return (
      matchesQuery &&
      (!filters.sport || c.sport === filters.sport) &&
      (!filters.location ||
        c.prefecture === filters.location ||
        c.location.includes(filters.location)) &&
      (!filters.specialty || c.specialties.includes(filters.specialty)) &&
      (!filters.language || c.languages.includes(filters.language)) &&
      (!filters.format || c.formats.includes(filters.format)) &&
      c.pricePerHour >= filters.minPrice &&
      c.pricePerHour <= filters.maxPrice &&
      (!filters.verifiedOnly || c.verified)
    );
  });

  return [...result].sort((a, b) => {
    switch (filters.sortBy) {
      case "price_asc":
        return a.pricePerHour - b.pricePerHour;
      case "price_desc":
        return b.pricePerHour - a.pricePerHour;
      case "reviews":
        return b.reviewCount - a.reviewCount;
      default:
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
    }
  });
}
