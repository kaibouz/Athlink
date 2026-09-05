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
  const [loading, setLoading] = useState<boolean>(Boolean(url));
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!url) return;
    let active = true;
    setLoading(true);
    setError(false);
    fetch(url, { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: T) => {
        if (active) setData(json);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, nonce]);

  return { data, loading, error, reload };
}
