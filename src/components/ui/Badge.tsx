import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "default" | "verified" | "success" | "warning" | "neutral";

const variants: Record<Variant, string> = {
  default: "bg-brand-50 text-brand-700",
  verified: "bg-emerald-50 text-emerald-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-slate-100 text-slate-600",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
