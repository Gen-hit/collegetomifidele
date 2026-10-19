import { site } from '@content/site';
import { href, type Locale } from '@/i18n/config';

/**
 * Lien WhatsApp vers le secrétariat, avec un message pré-rempli.
 * Tant que le numéro n'est pas renseigné dans content/site.ts, on renvoie vers la page Contact.
 */
export function whatsappLink(locale: Locale, message: string): string {
  const number = site.contact.whatsapp;
  if (!number) return href(locale, '/contact');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const { lat, lng, mapsUrl } = site.location;

export const maps = {
  /** Carte intégrée, chargée seulement à la demande du visiteur. */
  embedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`,
  /** Ouvre l'itinéraire vers le collège dans Google Maps. */
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  placeUrl: mapsUrl,
};

/** Affiche un numéro '+2376XXXXXXXX' sous la forme '+237 6XX XX XX XX'. */
export function formatPhone(phone: string): string {
  const match = phone.match(/^\+237(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!match) return phone;
  const [, a, b, c, d, e] = match;
  return `+237 ${a}${b} ${c} ${d} ${e}`;
}
