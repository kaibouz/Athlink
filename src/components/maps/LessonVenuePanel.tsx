"use client";

import { ExternalLink, MapPin, Navigation } from "lucide-react";
import {
  venueEmbedUrl,
  venueForBooking,
  venueMapLinks,
  type LessonVenue,
} from "@/lib/lesson-venues";
import { useLocale } from "@/lib/i18n/provider";
import type { Booking } from "@/types";
import { cn } from "@/lib/utils";

export function LessonVenuePanel({
  booking,
  venue: venueProp,
  compact = false,
  className,
}: {
  booking?: Booking;
  venue?: LessonVenue;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const venue = venueProp ?? (booking ? venueForBooking(booking) : null);
  const isOnline = booking?.format === "online" || (!venue && !venueProp);

  if (isOnline) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-3 py-2.5 text-xs text-brand-600",
          className,
        )}
      >
        <span className="inline-flex items-center gap-1.5 font-medium">
          <MapPin className="h-3.5 w-3.5 text-brand-400" />
          {t("lesson_venue_online")}
        </span>
      </div>
    );
  }

  if (!venue) return null;

  const links = venueMapLinks(venue);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-100 bg-surface",
        className,
      )}
    >
      <iframe
        title={venue.name}
        src={venueEmbedUrl(venue, compact ? 14 : 15)}
        className={cn("w-full border-0", compact ? "h-36" : "h-44")}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="space-y-2 border-t border-brand-50 p-3">
        <div>
          <p className="text-sm font-bold text-brand-950">{venue.name}</p>
          <p className="text-xs text-brand-600">{venue.address}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <a
            href={links.directionsGoogle}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-700"
          >
            <Navigation className="h-3 w-3" />
            {t("lesson_venue_directions")}
          </a>
          <a
            href={links.viewGoogle}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
          >
            <ExternalLink className="h-3 w-3" />
            Google
          </a>
          <a
            href={links.directionsApple}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
          >
            <ExternalLink className="h-3 w-3" />
            Apple
          </a>
        </div>
      </div>
    </div>
  );
}
