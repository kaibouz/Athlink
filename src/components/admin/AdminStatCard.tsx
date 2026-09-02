import type { LucideIcon } from "lucide-react";

export function AdminStatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: "blue" | "clay" | "green" | "red";
}) {
  const accentClass =
    accent === "clay"
      ? "from-[#e0a458] to-[#f2c94c]"
      : accent === "green"
        ? "from-[#3ddc97] to-[#22c7e0]"
        : accent === "red"
          ? "from-[#ff5f6d] to-[#f5a623]"
          : "from-[#3b6ef6] to-[#22c7e0]";

  return (
    <article className="admin-panel rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--admin-text-dim)]">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--admin-text)]">{value}</p>
          {sub ? <p className="mt-1 text-xs text-[var(--admin-text-dim)]">{sub}</p> : null}
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accentClass} text-white shadow-lg`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}
