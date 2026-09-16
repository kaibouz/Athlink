"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/provider";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";
import { Footer } from "@/components/layout/Footer";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { useAuth } from "@/lib/store";
import { joinPathFor, shouldEnterOnboarding } from "@/lib/onboarding";
import { isMarketingPath, isAuthFunnelPath, isMemberOnlyPath, MARKET_TO_PLATFORM } from "@/lib/market-to-platform";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HamburgerButton } from "@/components/ui/NavigationDrawer";

/** Marketing home: no chrome. Login/signup: minimal bar. App: sidebar. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerId = useId();
  const navDrawerId = `app-nav-drawer${drawerId.replace(/:/g, "")}`;

  const setDrawerOpen = useCallback((next: boolean) => setOpen(next), []);

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

  // Close the drawer on route change (link taps inside the panel).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        <header className="relative z-20 flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <AthlinkProLogo href="/" size="header" variant="monogram" tone="onGradient" priority />
          <div className="flex items-center gap-1.5">
            <ClerkNavAuth loginLabel={t("nav_login")} compact />
            <MarketingThemeToggle />
            <LocaleSwitcher compact />
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppSidebar
        mobileOpen={open}
        onOpenChange={setDrawerOpen}
        drawerId={navDrawerId}
        menuButtonRef={menuBtnRef}
      />

      <div className="flex min-h-full min-w-0 flex-1 flex-col md:pl-64">
        <div className="app-canvas flex min-h-full min-w-0 flex-1 flex-col">
          <header className="app-glass sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/10 px-4 md:hidden">
            <HamburgerButton
              open={open}
              onClick={() => setDrawerOpen(!open)}
              controlsId={navDrawerId}
              label={t("nav_menu")}
              buttonRef={menuBtnRef}
            />
            <AthlinkProLogo
              href={user?.role === "coach" ? MARKET_TO_PLATFORM.coachHome : MARKET_TO_PLATFORM.athleteHome}
              size="header"
              variant="monogram"
              tone="onGradient"
            />
            <div className="flex items-center gap-1">
              <ClerkNavAuth loginLabel={t("nav_login")} compact />
              <MarketingThemeToggle />
              <LocaleSwitcher compact />
            </div>
          </header>

          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
