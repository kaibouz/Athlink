import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: { frame: "h-14 w-14 rounded-xl", icon: "h-8 w-8" },
  md: { frame: "h-16 w-16 rounded-2xl", icon: "h-10 w-10" },
  lg: { frame: "h-24 w-24 rounded-2xl", icon: "h-14 w-14" },
} as const;

/** Generic shoulder-up person silhouette — never Dicebear or portrait photos. */
export function CoachAvatar({
  className,
  landing = false,
  size = "md",
}: {
  className?: string;
  landing?: boolean;
  size?: keyof typeof sizeClasses;
}) {
  const dims = sizeClasses[size];

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center shadow-sm",
        dims.frame,
        landing
          ? "border-2 border-white/20 bg-slate-800/80"
          : "border-2 border-white/30 bg-slate-800/70",
        className,
      )}
    >
      <svg
        viewBox="0 0 64 64"
        className={cn(dims.icon, "text-slate-400")}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="22" r="12" />
        <path d="M10 58c0-12.15 9.85-22 22-22s22 9.85 22 22" />
      </svg>
    </div>
  );
}
