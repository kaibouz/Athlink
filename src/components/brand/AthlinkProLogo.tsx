import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/athlinkpro-logo.png";

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-28 w-28",
} as const;

/** Official AthlinkPro mark — AP monogram + ATHLINKPRO wordmark */
export function AthlinkProLogo({
  className,
  href = "/",
  size = "default",
  priority = false,
}: {
  className?: string;
  href?: string | null;
  size?: keyof typeof sizeClasses;
  priority?: boolean;
}) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt="AthlinkPro"
      width={2000}
      height={2000}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("rounded-lg object-contain", sizeClasses[size], className)}
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
