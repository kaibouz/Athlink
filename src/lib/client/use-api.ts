"use client";

import { useCallback, useEffect, useState } from "react";

/** Small JSON fetch hook for authenticated app data (progress, breakdowns, messages…). */
export function useApi<T>(url: string | null): {
  data: T | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [nonce, setNonce] = useState(0);
  // The request (url + reload count) that last finished, and whether it failed.
  const [settled, setSettled] = useState<{ key: string; error: boolean } | null>(null);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const requestKey = url ? `${nonce}:${url}` : null;
  const loading = requestKey !== null && settled?.key !== requestKey;
  const error = requestKey !== null && settled?.key === requestKey && settled.error;

  useEffect(() => {
    if (!url) return;
    const key = `${nonce}:${url}`;
    let active = true;
    fetch(url, { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: T) => {
        if (!active) return;
        setData(json);
        setSettled({ key, error: false });
      })
      .catch(() => {
        if (active) setSettled({ key, error: true });
      });
    return () => {
      active = false;
    };
  }, [url, nonce]);

  return { data, loading, error, reload };
}
