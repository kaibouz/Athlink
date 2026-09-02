import { getCoachById } from "@/lib/data";
import { mapEmbedUrl, regionForAthlete, type CaRegionId } from "@/lib/dashboard-analytics";
import type { Booking } from "@/types";

export type LessonVenue = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  regionId: CaRegionId;
};

const REGION_VENUES: Record<CaRegionId, LessonVenue> = {
  la: {
    name: "Blair Field",
    address: "2250 E Carson St, Long Beach, CA 90810",
    lat: 33.8314,
    lng: -118.151,
    regionId: "la",
  },
  oc: {
    name: "Great Park Championship Stadium",
    address: "8000 Great Park Blvd, Irvine, CA 92618",
    lat: 33.668,
    lng: -117.746,
    regionId: "oc",
  },
  sd: {
    name: "Morley Field",
    address: "2545 7th Ave, San Diego, CA 92102",
    lat: 32.7357,
    lng: -117.1484,
    regionId: "sd",
  },
  bay: {
    name: "Stanford Sunken Diamond",
    address: "655 Campus Dr, Stanford, CA 94305",
    lat: 37.433,
    lng: -122.17,
    regionId: "bay",
  },
  sac: {
    name: "Sutter Health Park",
    address: "400 Ballpark Dr, West Sacramento, CA 95691",
    lat: 38.5804,
    lng: -121.5136,
    regionId: "sac",
  },
  ie: {
    name: "Big League Dreams Riverside",
    address: "10700 Indiana Ave, Riverside, CA 92503",
    lat: 33.9056,
    lng: -117.2848,
    regionId: "ie",
  },
  cv: {
    name: "Chukchansi Park",
    address: "1800 Tulare St, Fresno, CA 93721",
    lat: 36.7344,
    lng: -119.7903,
    regionId: "cv",
  },
};

export function regionFromCoachLocation(location: string): CaRegionId {
  const l = location.toLowerCase();
  if (l.includes("orange")) return "oc";
  if (l.includes("diego")) return "sd";
  if (l.includes("francisco") || l.includes("bay") || l.includes("jose")) return "bay";
  if (l.includes("sacramento")) return "sac";
  if (l.includes("inland") || l.includes("riverside")) return "ie";
  if (l.includes("fresno") || l.includes("central")) return "cv";
  return "la";
}

/** Primary in-person training venue for a coach's home region. */
export function venueForCoach(location: string): LessonVenue {
  return REGION_VENUES[regionFromCoachLocation(location)];
}

/** Resolve a concrete lesson venue for a booking (demo: region-based facilities). */
export function venueForBooking(booking: Booking): LessonVenue | null {
  if (booking.format === "online") return null;
  const coach = getCoachById(booking.coachId);
  const athleteRegion = regionForAthlete(booking.athleteName);
  const coachRegion = coach ? regionFromCoachLocation(coach.location) : athleteRegion;
  // Prefer athlete metro; fall back to coach home base.
  return REGION_VENUES[athleteRegion] ?? REGION_VENUES[coachRegion];
}

export function venueEmbedUrl(venue: LessonVenue, zoom = 15) {
  return mapEmbedUrl(venue.lat, venue.lng, zoom);
}

export function venueMapLinks(venue: LessonVenue) {
  const { lat, lng, name, address } = venue;
  const label = `${name}, ${address}`;
  return {
    viewGoogle: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    viewApple: `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label)}`,
    directionsGoogle: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&destination_place_id=`,
    directionsApple: `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(label)}`,
  };
}
