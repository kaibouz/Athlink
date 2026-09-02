"use client";

/** Fire-and-forget MVP event tracking (no PII beyond optional user session). */
export function trackEvent(
  name: string,
  props?: Record<string, string>,
  coachId?: string,
) {
  if (typeof window === "undefined") return;
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name,
      coachId,
      path: window.location.pathname,
      props,
    }),
  }).catch(() => {
    /* ignore */
  });
}
