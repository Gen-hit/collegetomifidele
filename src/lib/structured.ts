import { site } from '@content/site';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

const dayNames = { weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], saturday: ['Saturday'], sunday: ['Sunday'] } as const;

/**
 * La fiche du collège pour Google (données structurées schema.org) : nom, adresse, position, téléphone, horaires.
 * Tout vient de content/site.ts ; une information absente n'est simplement pas publiée.
 */
export function schoolJsonLd(locale: Locale, dict: Dictionary) {
  const absolute = (path: string) => new URL(path, site.url).toString();
  const { address, city, lat, lng, mapsUrl } = site.location;
  const hours = site.openingHours.filter((row) => !row.closed && row.open && row.close);
  const social = Object.values(site.social).filter((url): url is string => Boolean(url));

  return {
    '@context': 'https://schema.org',
    '@type': 'School',
    '@id': absolute('/#college'),
    name: site.name,
    alternateName: site.shortName,
    slogan: site.motto,
    description: dict.meta.description,
    url: absolute(href(locale)),
    logo: absolute(site.logo.src),
    image: absolute(`/og/college-tomi-fidele-${locale}.jpg`),
    knowsLanguage: ['fr', 'en'],
    address: {
      '@type': 'PostalAddress',
      ...(address ? { streetAddress: address } : {}),
      ...(city ? { addressLocality: city } : {}),
      addressCountry: 'CM',
    },
    geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng },
    hasMap: mapsUrl,
    ...(site.contact.phones[0] ? { telephone: site.contact.phones[0] } : {}),
    ...(site.contact.email ? { email: site.contact.email } : {}),
    ...(social.length > 0 ? { sameAs: social } : {}),
    ...(hours.length > 0
      ? { openingHoursSpecification: hours.map((row) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayNames[row.days], opens: row.open, closes: row.close })) }
      : {}),
  };
}
