import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/store";
import { LocaleProvider } from "@/lib/i18n/provider";
import { CoachToolsProvider } from "@/lib/coach-tools";
import { SocialProvider } from "@/lib/social-store";
import { GrowthProvider } from "@/lib/growth-store";
import { ScoutProvider } from "@/lib/scout-store";
import { ThemeProvider } from "@/lib/theme";
import { AppShell } from "@/components/layout/AppShell";
import { MobileNav } from "@/components/layout/MobileNav";
import { SitePageTransition } from "@/components/layout/SitePageTransition";
import { ClerkAuthBridge } from "@/components/auth/ClerkAuthBridge";

/** Variable axes — brand/display Latin */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** Variable axes — UI / Japanese body */
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AthLink — Private baseball coaching in California",
    template: "%s | AthLink",
  },
  description:
    "Marketplace connecting baseball athletes with experienced private coaches. Search, book, pay, and message — launching in California.",
  applicationName: "AthLink",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AthLink",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1220",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${manrope.variable} ${notoSansJp.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";localStorage.setItem("athlink_theme","dark");}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}})();`,
          }}
        />
      </head>
      <body
        className="flex min-h-full flex-col app-page-bg-subtle font-sans text-foreground"
        suppressHydrationWarning
      >
        <ClerkProvider>
          <ThemeProvider>
            <LocaleProvider>
              <AuthProvider>
                <ClerkAuthBridge />
                <CoachToolsProvider>
                  <SocialProvider>
                    <GrowthProvider>
                      <ScoutProvider>
                        <SitePageTransition>
                          <AppShell>
                            <main className="flex-1 pb-20 md:pb-0">{children}</main>
                          </AppShell>
                          <MobileNav />
                        </SitePageTransition>
                      </ScoutProvider>
                    </GrowthProvider>
                  </SocialProvider>
                </CoachToolsProvider>
              </AuthProvider>
            </LocaleProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}