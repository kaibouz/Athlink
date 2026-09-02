"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/store";
import { shouldEnterOnboarding } from "@/lib/onboarding";
import { AthLinkMark } from "@/components/brand/AthLinkMark";

/** Marketing home: no chrome. Login/signup: minimal bar. App: sidebar. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || !user) return;
    if (pathname === "/onboarding" || pathname === "/" || pathname === "/login") return;
    if (shouldEnterOnboarding(user.id)) {
      router.replace("/onboarding");
    }
  }, [hydrated, user, pathname, router]);

  const isIosPreview = pathname === "/ios";
  const isHome = pathname === "/" && !user;
  const isAuthForm =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding" ||
    pathname === "/dns";
  const isOnboarding = pathname === "/onboarding";

  if (isIosPreview || isHome || pathname === "/dns") {
    return <div className="min-h-full flex-1">{children}</div>;
  }

  if (isOnboarding) {
    return <div className="min-h-full flex-1">{children}</div>;
  }

  if (isAuthForm && !user) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <header className="relative z-20 flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white">
              A
            </span>
            <span className="text-lg">
              <AthLinkMark />
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher compact />
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppSidebar mobileOpen={open} onClose={() => setOpen(false)} />

      <div className="flex min-h-full min-w-0 flex-1 flex-col md:pl-64">
        <div className="app-canvas flex min-h-full min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-brand-100/80 bg-surface/90 px-4 backdrop-blur-md md:hidden">
            <button
              type="button"
              className="rounded-lg p-2 text-brand-700 hover:bg-brand-50"
              onClick={() => setOpen(true)}
              aria-label={t("nav_menu")}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href={user?.role === "coach" ? "/coach/dashboard" : "/bookings"}
              className="flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white">
                A
              </span>
              <span className="text-base">
                <AthLinkMark />
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
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
