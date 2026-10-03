"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/provider";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { PasskeyEnrollPrompt } from "@/components/auth/PasskeyEnrollPrompt";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Footer } from "@/components/layout/Footer";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { useAuth } from "@/lib/store";
import { useForceDarkTheme } from "@/lib/theme";
import { joinPathFor, shouldEnterOnboarding } from "@/lib/onboarding";
import { isMarketingPath, isAuthFunnelPath, isMemberOnlyPath, MARKET_TO_PLATFORM } from "@/lib/market-to-platform";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";

/** Platform surfaces are dark-only — see useForceDarkTheme. Renders nothing. */
function ForceDarkTheme() {
  useForceDarkTheme();
  return null;
}

/** Marketing home: no chrome. Login/signup: minimal bar. App: sidebar. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !user) return;
    const exempt =
      isMarketingPath(pathname) ||
      isAuthFunnelPath(pathname) ||
      pathname === "/app";
    if (exempt) return;
    if (shouldEnterOnboarding(user.id)) {
      router.replace(joinPathFor(user.role === "coach" ? "coach" : "athlete"));
    }
  }, [hydrated, user, pathname, router]);

  // After logout (or cold visit), leave member surfaces for the marketplace HQ.
  useEffect(() => {
    if (!hydrated || user) return;
    if (!isMemberOnlyPath(pathname)) return;
    router.replace(MARKET_TO_PLATFORM.hq);
  }, [hydrated, user, pathname, router]);

  const isIosPreview = pathname === "/ios";
  const isMarketingHome = isMarketingPath(pathname);
  const isJoinFlow = isAuthFunnelPath(pathname) && pathname.startsWith("/join/");
  const isAdminFlow = pathname.startsWith("/admin");
  const isAppEntry = pathname === "/app";
  const isClerkAuthRoute =
    pathname === "/sign-in" ||
    pathname.startsWith("/sign-in/") ||
    pathname === "/sign-up" ||
    pathname.startsWith("/sign-up/");
  const isAuthForm =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/dns" ||
    isClerkAuthRoute;

  // Don't paint empty member chrome while redirecting guests to HQ.
  if (hydrated && !user && isMemberOnlyPath(pathname)) {
    return <div className="min-h-full flex-1" aria-busy="true" />;
  }

  if (isIosPreview || isMarketingHome || pathname === "/dns") {
    return <div className="min-h-full flex-1">{children}</div>;
  }

  if (isJoinFlow || isAdminFlow || isAppEntry) {
    return <div className="min-h-full flex-1">{children}</div>;
  }

  if (isClerkAuthRoute || (isAuthForm && !user)) {
    return (
      <div className="app-page-bg flex min-h-full flex-1 flex-col">
        <ForceDarkTheme />
        <header className="relative z-20 flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <AthlinkProLogo href="/" size="header" variant="lockup" tone="onGradient" priority />
          <div className="flex items-center gap-1.5">
            <ClerkNavAuth loginLabel={t("nav_login")} compact />
            <LocaleSwitcher compact />
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ForceDarkTheme />
      <AppTopNav />
      <PasskeyEnrollPrompt />

      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <div className="app-canvas flex min-h-full min-w-0 flex-1 flex-col">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
