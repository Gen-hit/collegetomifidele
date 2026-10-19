import type { Locale } from '@/i18n/config';

const currency: Record<Locale, string> = { fr: 'F CFA', en: 'FCFA' };
const intlLocale: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB' };

/** 150000 → « 150 000 F CFA » (fr) ou « 150,000 FCFA » (en). Sans montant : le texte de remplacement. */
export function formatMoney(amount: number | null | undefined, locale: Locale, placeholder: string): string {
  if (amount === null || amount === undefined) return placeholder;
  return `${new Intl.NumberFormat(intlLocale[locale]).format(amount)} ${currency[locale]}`;
}

/** '2026-09-15' → « 15 septembre 2026 » (fr) ou « 15 September 2026 » (en). Sans date : le texte de remplacement. */
export function formatDate(iso: string | null | undefined, locale: Locale, placeholder: string): string {
  if (!iso) return placeholder;
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return placeholder;
  const text = new Intl.DateTimeFormat(intlLocale[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  // En français, le premier jour du mois s'écrit « 1er ».
  return locale === 'fr' ? text.replace(/^1 /, '1er ') : text;
}

/** '2026-09-07' → « lundi 7 septembre 2026 » (fr) ou « Monday 7 September 2026 » (en). */
export function formatLongDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T12:00:00Z`);
  const part = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale[locale], { ...options, timeZone: 'UTC' }).format(date);
  // Assemblé à la main : l'ordre et la ponctuation ne dépendent pas de la version du navigateur ou de Node.
  const day = locale === 'fr' && date.getUTCDate() === 1 ? '1er' : String(date.getUTCDate());
  return `${part({ weekday: 'long' })} ${day} ${part({ month: 'long' })} ${date.getUTCFullYear()}`;
}

/** '07:30' → « 7 h 30 » (fr) ou « 7:30 am » (en) ; '08:00' → « 8 h » ou « 8 am ». */
export function formatClock(time: string, locale: Locale): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (locale === 'fr') return minutes ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`;
  const suffix = hours < 12 ? 'am' : 'pm';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return minutes ? `${hour}:${String(minutes).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

/** ('07:30', '15:30') → « 7 h 30 à 15 h 30 » (fr) ou « 7:30 am to 3:30 pm » (en). Sans horaire : le texte de remplacement. */
export function formatHours(open: string | null, close: string | null, locale: Locale, placeholder: string): string {
  if (!open || !close) return placeholder;
  return `${formatClock(open, locale)} ${locale === 'fr' ? 'à' : 'to'} ${formatClock(close, locale)}`;
}

/**
 * En français, une espace précède « : », « ; », « ? », « ! » et suit « « ». On la rend insécable,
 * pour qu'un signe de ponctuation ne se retrouve jamais seul au début d'une ligne sur un petit écran.
 */
export function typo<T>(value: T, locale: Locale): T {
  if (locale !== 'fr') return value;
  if (typeof value === 'string') return value.replace(/ ([:;?!»])/g, '\u00a0$1').replace(/« /g, '«\u00a0') as T;
  if (Array.isArray(value)) return value.map((item) => typo(item, locale)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typo(item, locale)])) as T;
  }
  return value;
}

/** Met la première lettre en majuscule : « septembre 2026 » → « Septembre 2026 ». */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** 0.873 → « 87,3 % » (fr) ou « 87.3% » (en). Une décimale seulement si elle est utile. */
export function formatPercent(ratio: number | null | undefined, locale: Locale, placeholder: string): string {
  if (ratio === null || ratio === undefined) return placeholder;
  const value = Math.round(ratio * 1000) / 10;
  const text = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 1 }).format(value);
  return locale === 'fr' ? `${text} %` : `${text}%`;
}

/** Nombre entier avec séparateur de milliers. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(value);
}

/** Remplace %cle% par sa valeur dans un modèle de texte : fill('Session %year%', { year: '2026' }). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/%(\w+)%/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** '677123456' ou '+237677123456' → « 6 77 12 34 56 » : le format lu à voix haute au Cameroun. */
export function formatLocalPhone(number: string): string {
  const digits = number.replace(/\D/g, '').replace(/^237(?=\d{9}$)/, '');
  const match = digits.match(/^(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  return match ? match.slice(1).join(' ') : number;
}
