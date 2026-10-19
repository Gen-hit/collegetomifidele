export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Construit une adresse localisée : href('en', '/admissions') → '/en/admissions/'. */
export function href(locale: Locale, path = '/'): string {
  const [pathname, hash] = path.split('#');
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const base = clean ? `/${locale}/${clean}/` : `/${locale}/`;
  return hash ? `${base}#${hash}` : base;
}
