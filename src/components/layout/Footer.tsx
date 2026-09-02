"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/provider";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="mt-auto border-t border-white/10 bg-ink text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-black text-white">
              A
            </span>
            <span className="text-lg font-bold text-white">AthLink</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">{t("footer_tagline")}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{t("footer_product")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/search" className="hover:text-white">
                {t("footer_find")}
              </Link>
            </li>
            <li>
              <Link href="/coach/register" className="hover:text-white">
                {t("footer_register")}
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="hover:text-white">
                {t("footer_bookings")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{t("footer_support")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <a href="mailto:hello@athlink.app" className="hover:text-white">
                hello@athlink.app
              </a>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">
                {t("nav_admin")}
              </Link>
            </li>
            <li>{t("footer_minor")}</li>
            <li>© 2026 AthLink Inc.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
