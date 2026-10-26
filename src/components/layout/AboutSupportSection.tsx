"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/provider";

/**
 * The product / support block that used to sit in a footer on every page.
 * It now lives only here, inside account settings, so the app surfaces stay
 * clear. Same links and contact details, laid out for a settings panel.
 */
export function AboutSupportSection() {
  const { t } = useLocale();

  const productLinks: { href: string; label: string }[] = [
    { href: "/search", label: t("footer_find") },
    { href: "/coach/register", label: t("footer_register") },
    { href: "/bookings", label: t("footer_bookings") },
  ];

  return (
    <div className="border-t border-brand-100 pt-4">
      <span className="mb-1.5 block text-sm font-medium text-brand-800">
        {t("footer_product")}
      </span>
      <ul className="space-y-1.5 text-sm">
        {productLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-brand-700 hover:text-brand-950 hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <span className="mb-1.5 mt-4 block text-sm font-medium text-brand-800">
        {t("footer_support")}
      </span>
      <ul className="space-y-1.5 text-sm">
        <li>
          <a href="mailto:hello@athlink.app" className="text-brand-700 hover:text-brand-950 hover:underline">
            hello@athlink.app
          </a>
        </li>
        <li>
          <Link href="/admin" className="text-brand-700 hover:text-brand-950 hover:underline">
            {t("nav_admin")}
          </Link>
        </li>
        <li className="text-brand-600">{t("footer_minor")}</li>
      </ul>

      <p className="mt-4 text-xs text-brand-500">{t("footer_tagline")}</p>
      <p className="mt-1 text-xs text-brand-500">© 2026 AthlinkPro Inc.</p>
    </div>
  );
}
