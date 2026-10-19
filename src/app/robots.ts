import type { MetadataRoute } from 'next';
import { site } from '@content/site';

export const dynamic = 'force-static';

/**
 * Consignes aux moteurs de recherche (robots.txt).
 * Tant que le site est en test (NEXT_PUBLIC_SITE_INDEXABLE différent de « true »), tout est fermé.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: { userAgent: '*', disallow: '/' } };
  // L'administration (/admin) reste toujours fermée aux moteurs de recherche.
  return { rules: { userAgent: '*', allow: '/', disallow: '/admin/' }, sitemap: new URL('/sitemap.xml', site.url).toString() };
}
