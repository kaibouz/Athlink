"use client";

import type { ReactNode } from "react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { QuickMyPageEntry } from "@/components/auth/QuickMyPageEntry";

/** Centered AthlinkPro branding above Clerk sign-in / sign-up cards */
export function ClerkAuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <AthlinkProLogo className="mb-6" href="/" size="xl" tone="onGradient" priority />
      <div className="mb-6 w-full max-w-[420px]">
        <QuickMyPageEntry />
      </div>
      {children}
    </div>
  );
}
