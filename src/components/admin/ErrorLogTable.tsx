"use client";

import { useState } from "react";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";

type Row = { id: string; createdAt: string; source: string; message: string; path: string | null; userId: string | null; stack: string | null };

/** Server errors captured by logError(), newest first. */
export function ErrorLogTable() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useDeferredEffect(() => {
    void fetch("/api/admin/errors", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { errors: Row[] } | null) => setRows(d?.errors ?? []));
  }, []);
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-bold text-brand-950">Server errors</h2>
      {rows === null ? (
        <p className="text-sm text-brand-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-500">No errors recorded.</p>
      ) : (
        <ul className="divide-y divide-white/5 rounded-xl border border-white/10">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 text-sm">
              <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full text-left">
                <span className="text-brand-500">{new Date(r.createdAt).toLocaleString()}</span>
                <span className="ml-2 font-semibold text-brand-900">{r.source}</span>
                <span className="ml-2 text-rose-300">{r.message}</span>
              </button>
              {open === r.id && r.stack ? (
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-brand-600">{r.stack}</pre>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
