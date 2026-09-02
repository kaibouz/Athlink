import type { ReactNode } from "react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";

/** Centered AthlinkPro branding above Clerk sign-in / sign-up cards */
export function ClerkAuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <AthlinkProLogo className="mb-8" href="/" size="xl" priority />
      {children}
    </div>
  );
}
