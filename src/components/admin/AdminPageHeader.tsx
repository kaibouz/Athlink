"use client";

import { RefreshCw } from "lucide-react";

export function AdminPageHeader({
  title,
  subtitle,
  lastRefresh,
  onRefresh,
  refreshing,
  children,
}: {
  title: string;
  subtitle?: string;
  lastRefresh?: Date | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--admin-text)] sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[var(--admin-text-dim)]">{subtitle}</p> : null}
        {lastRefresh ? (
          <p className="mt-1 text-xs text-[var(--admin-text-dim)]">
            Updated {lastRefresh.toLocaleTimeString()}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="admin-btn-ghost inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        ) : null}
      </div>
    </div>
  );
}
