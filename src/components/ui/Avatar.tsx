"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function initialsFrom(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A"
  );
}

/**
 * Avatar that never shows a broken image.
 *
 * Seeded avatars point at an external generator, so a slow or blocked network —
 * a conference wifi, say — would otherwise leave broken-image icons on every
 * screen that lists a person. On failure this falls back to initials on the
 * brand gradient, which is what the app's own `.mx-avatar` already looks like.
 */
export function Avatar({
  src,
  name,
  className,
  size = 36,
}: {
  src?: string | null;
  name: string;
  className?: string;
  /** Rendered box size in px; drives the initials' type size. */
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-bold text-white"
          style={{
            fontSize: Math.max(10, Math.round(size * 0.34)),
            background: "linear-gradient(135deg, var(--mx-blue-1), var(--mx-blue-2))",
          }}
          aria-hidden
        >
          {initialsFrom(name)}
        </span>
      )}
    </span>
  );
}
