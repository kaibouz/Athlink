import type { MessageKey, UiLocale } from "@/lib/i18n/messages";

export type Localized = { en: string; ja: string; es: string };

export function loc(locale: UiLocale, value: Localized | string): string {
  if (typeof value === "string") return value;
  return value[locale] || value.en;
}

export function locList(locale: UiLocale, values: (Localized | string)[]): string[] {
  return values.map((v) => loc(locale, v));
}

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function sportLabel(t: Translate, id: string): string {
  return t(`sport_${id}` as MessageKey);
}

export function specialtyLabel(t: Translate, id: string): string {
  return t(`specialty_${id}` as MessageKey);
}

export function languageLabel(t: Translate, id: string): string {
  const key = `lang_${id.toLowerCase()}` as MessageKey;
  return t(key);
}
