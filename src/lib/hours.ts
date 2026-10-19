import { site } from '@content/site';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatHours } from '@/lib/format';

/** Les heures d'ouverture du secrétariat, ligne par ligne : « Lundi à vendredi » → « 7 h 30 à 15 h 30 ». */
export function openingRows(locale: Locale, dict: Dictionary, placeholder: string): { key: string; days: string; hours: string; closed: boolean }[] {
  return site.openingHours.map((row) => ({
    key: row.days,
    days: dict.common.days[row.days],
    hours: row.closed ? dict.common.closed : formatHours(row.open, row.close, locale, placeholder),
    closed: row.closed,
  }));
}

/**
 * Les horaires en une ligne, pour le pied de page et les encarts de contact :
 * « Lundi à vendredi : 7 h 30 à 15 h 30 ». Tant qu'ils manquent dans content/site.ts, l'emplacement s'affiche.
 */
export function hoursSummary(locale: Locale, dict: Dictionary): string {
  const weekdays = site.openingHours.find((row) => row.days === 'weekdays');
  if (!weekdays || weekdays.closed || !weekdays.open || !weekdays.close) return dict.common.hoursPlaceholder;
  return fill(dict.common.hoursLine, {
    days: dict.common.days.weekdays,
    hours: formatHours(weekdays.open, weekdays.close, locale, ''),
  });
}
