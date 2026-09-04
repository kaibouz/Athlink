"use client";

import { useEffect } from "react";

/** Old standalone page — How AthlinkPro works now lives on HQ. */
export default function HowItWorksRedirect() {
  useEffect(() => {
    window.location.replace("/#how-it-works");
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-black text-sm text-brand-500">
      …
    </div>
  );
}
