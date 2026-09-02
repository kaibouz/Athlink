"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  csv?: (row: T) => string;
};

export function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  filterPlaceholder = "Filter…",
  filterFn,
  emptyMessage = "No rows",
}: {
  columns: AdminColumn<T>[];
  rows: T[];
  filterPlaceholder?: string;
  filterFn?: (row: T, query: string) => boolean;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let list = rows;
    if (query.trim() && filterFn) {
      list = list.filter((row) => filterFn(row, query.trim().toLowerCase()));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.csv) {
        list = [...list].sort((a, b) => {
          const av = col.csv!(a);
          const bv = col.csv!(b);
          const cmp = av.localeCompare(bv, undefined, { numeric: true });
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }
    return list;
  }, [rows, query, filterFn, sortKey, sortDir, columns]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function exportCsv() {
    const headers = columns.map((c) => c.header);
    const lines = filtered.map((row) =>
      columns.map((c) => `"${(c.csv ? c.csv(row) : "").replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-panel overflow-hidden rounded-xl border border-[var(--admin-border)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-dim)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={filterPlaceholder}
            className="admin-input w-full rounded-lg py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button type="button" onClick={exportCsv} className="admin-btn-ghost inline-flex items-center gap-2 text-sm">
          <Download className="h-4 w-4" />
          CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-[var(--admin-panel-elevated)] text-left text-[var(--admin-text-dim)]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.sortable !== false && col.csv ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn("hover:text-[var(--admin-text)]", sortKey === col.key && "text-[var(--admin-text)]")}
                    >
                      {col.header}
                      {sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--admin-text-dim)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[var(--admin-border)] hover:bg-white/[0.02]"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-[var(--admin-text)]">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
