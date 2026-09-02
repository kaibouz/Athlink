import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/athlinkpro-logo.png";
const LOGO_TRANSPARENT_SRC = "/brand/athlinkpro-logo-transparent.png";
const MONOGRAM_SRC = "/brand/athlinkpro-monogram.png";

const sizeClasses = {
  sm: "h-8 w-8",
  header: "h-11 w-11",
  default: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-28 w-28",
} as const;

/** Official AthlinkPro mark — AP monogram + ATHLINKPRO wordmark */
export function AthlinkProLogo({
  className,
  href = "/",
  size = "default",
  variant = "full",
  tone = "default",
  priority = false,
}: {
  className?: string;
  href?: string | null;
  size?: keyof typeof sizeClasses;
  /** monogram crops to the AP mark — readable in compact headers */
  variant?: "full" | "monogram";
  /** onGradient = transparent AP mark for dark blue hero/nav washes; default = solid black tile */
  tone?: "default" | "onGradient";
  priority?: boolean;
}) {
  const onGradient = tone === "onGradient";

  const image =
    variant === "monogram" ? (
      onGradient ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={MONOGRAM_SRC}
          alt="AthlinkPro"
          width={1300}
          height={560}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn("shrink-0 object-contain", sizeClasses[size], className)}
        />
      ) : (
        <div
          className={cn("shrink-0 overflow-hidden rounded-lg", sizeClasses[size], className)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_SRC}
            alt="AthlinkPro"
            width={2000}
            height={2000}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-[155%] w-full object-cover object-top"
          />
        </div>
      )
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={onGradient ? LOGO_TRANSPARENT_SRC : LOGO_SRC}
        alt="AthlinkPro"
        width={onGradient ? 1154 : 2000}
        height={onGradient ? 895 : 2000}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          onGradient ? "object-contain" : "rounded-lg object-contain",
          sizeClasses[size],
          className,
        )}
      />
    );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="AthlinkPro home"
        className="inline-flex shrink-0 transition-opacity hover:opacity-90"
      >
        {image}
      </Link>
    );
  }

  return image;
}
