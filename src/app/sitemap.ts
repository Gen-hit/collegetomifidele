import type { MetadataRoute } from 'next';
import { articles } from '@content/news';
import { site } from '@content/site';
import { href, locales } from '@/i18n/config';

export const dynamic = 'force-static';

/** Toutes les pages du site, dans l'ordre du menu. Ajouter ici le chemin de toute nouvelle page. */
const paths = [
  '/',
  '/about',
  '/about/principal',
  '/programmes',
  '/programmes/francophone',
  '/programmes/anglophone',
  '/programmes/technique',
  '/results',
  '/facilities',
  '/campus',
  '/calendar',
  '/gallery',
  '/documents',
  '/news',
  '/admissions',
  '/admissions/fees',
  '/contact',
  '/privacy',
];

/**
 * Plan du site pour les moteurs de recherche (sitemap.xml) : chaque page dans ses deux langues.
 * Les articles modèles n'y figurent pas.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const all = [...paths, ...articles.filter((article) => !article.sample).map((article) => `/news/${article.slug}`)];
  const absolute = (path: string) => new URL(path, site.url).toString();
  const lastModified = new Date();

  return all.flatMap((path) =>
    locales.map((locale) => ({
      url: absolute(href(locale, path)),
      lastModified,
      alternates: { languages: Object.fromEntries(locales.map((other) => [other, absolute(href(other, path))])) },
    })),
  );
}
