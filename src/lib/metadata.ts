import type { Metadata } from 'next';
import { site } from '@content/site';
import { href, type Locale } from '@/i18n/config';

/**
 * L'image qui accompagne un lien partagé sur WhatsApp ou Facebook (1 200 × 630 px, une par langue).
 * Les fichiers sont dans public/og/. Un article avec photo de couverture utilise sa propre photo.
 */
export function shareImage(locale: Locale) {
  return { url: `/og/college-tomi-fidele-${locale}.jpg`, width: 1200, height: 630, alt: site.name };
}

/**
 * Titre, description et liens entre les deux langues d'une page intérieure.
 * Le titre est complété par le nom du collège (voir `title.template` dans le layout).
 */
export function pageMetadata(locale: Locale, path: string, meta: { title: string; description: string }): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: href(locale, path),
      languages: { fr: href('fr', path), en: href('en', path) },
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: `${meta.title} · ${site.name}`,
      description: meta.description,
      url: href(locale, path),
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
      images: [shareImage(locale)],
    },
    twitter: { card: 'summary_large_image' },
  };
}
