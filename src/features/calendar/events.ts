import { calendar, type CalendarEvent } from '@content/calendar';
import type { Locale } from '@/i18n/config';
import { capitalize, fill, formatLongDate, typo } from '@/lib/format';
import type { CalendarItem, CalendarMonth } from './dates';

const intlLocale: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB' };

type DatedEvent = CalendarEvent & { start: string };

function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso;
}

/**
 * Contrôle content/calendar.ts : une faute de saisie arrête la construction du site avec un message clair,
 * plutôt que d'afficher une date fausse aux parents.
 */
export function checkedEvents(events: CalendarEvent[] = calendar.events): CalendarEvent[] {
  const seen = new Set<string>();
  for (const event of events) {
    const where = `content/calendar.ts, événement « ${event.id} »`;
    if (!/^[a-z0-9-]+$/.test(event.id)) throw new Error(`${where} : l'identifiant ne doit contenir que des minuscules, des chiffres et des tirets.`);
    if (seen.has(event.id)) throw new Error(`${where} : cet identifiant est utilisé deux fois.`);
    seen.add(event.id);
    if (event.start !== null && !isRealDate(event.start)) throw new Error(`${where} : la date « ${event.start} » n'existe pas (format attendu : AAAA-MM-JJ).`);
    if (event.end !== undefined) {
      if (event.start === null) throw new Error(`${where} : une date de fin est indiquée sans date de début.`);
      if (!isRealDate(event.end)) throw new Error(`${where} : la date de fin « ${event.end} » n'existe pas (format attendu : AAAA-MM-JJ).`);
      if (event.end < event.start) throw new Error(`${where} : la date de fin précède la date de début.`);
    }
  }
  return events;
}

/** Les dates connues, de la plus proche à la plus lointaine. Le même jour, une période passe avant une journée. */
export function datedEvents(events: CalendarEvent[] = calendar.events): DatedEvent[] {
  return checkedEvents(events)
    .filter((event): event is DatedEvent => event.start !== null)
    .map((event, index) => ({ event, index }))
    .sort((a, b) => a.event.start.localeCompare(b.event.start) || (b.event.end ?? b.event.start).localeCompare(a.event.end ?? a.event.start) || a.index - b.index)
    .map(({ event }) => event);
}

/** Les événements dont la date n'est pas encore fixée, dans l'ordre du fichier. */
export function pendingEvents(events: CalendarEvent[] = calendar.events): CalendarEvent[] {
  return checkedEvents(events).filter((event) => event.start === null);
}

function parts(iso: string, locale: Locale) {
  const date = new Date(`${iso}T12:00:00Z`);
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale[locale], { ...options, timeZone: 'UTC' }).format(date);
  return { weekday: format({ weekday: 'short' }), day: String(date.getUTCDate()), month: format({ month: 'short' }) };
}

/** Prépare les dates pour l'affichage dans une langue. `rangeTemplate` : « Du %start% au %end% ». */
export function calendarItems(locale: Locale, rangeTemplate: string, events: CalendarEvent[] = calendar.events): CalendarItem[] {
  return datedEvents(events).map((event) => {
    const end = event.end ?? event.start;
    const last = parts(end, locale);
    return {
      id: event.id,
      category: event.category,
      title: typo(event.title[locale], locale),
      note: typo(event.note?.[locale], locale),
      confirm: event.confirm === true,
      start: event.start,
      end,
      monthKey: event.start.slice(0, 7),
      ...parts(event.start, locale),
      until: end === event.start ? undefined : `${last.day} ${last.month}`,
      dateLabel:
        end === event.start
          ? capitalize(formatLongDate(event.start, locale))
          : capitalize(fill(rangeTemplate, { start: formatLongDate(event.start, locale), end: formatLongDate(end, locale) })),
    };
  });
}

/** Tous les mois de l'année scolaire, du premier au dernier événement daté, sans trou. */
export function calendarMonths(locale: Locale, events: CalendarEvent[] = calendar.events): CalendarMonth[] {
  const dated = datedEvents(events);
  if (dated.length === 0) return [];
  const first = dated[0].start;
  const last = dated.map((event) => event.end ?? event.start).sort().at(-1) as string;
  const months: CalendarMonth[] = [];
  let year = Number(first.slice(0, 4));
  let month = Number(first.slice(5, 7));
  const format = new Intl.DateTimeFormat(intlLocale[locale], { month: 'long', timeZone: 'UTC' });
  while (`${year}-${String(month).padStart(2, '0')}` <= last.slice(0, 7)) {
    const inline = `${format.format(new Date(Date.UTC(year, month - 1, 15)))} ${year}`;
    months.push({ key: `${year}-${String(month).padStart(2, '0')}`, year, month, label: capitalize(inline), inline });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

/** Les sept jours de la semaine, du lundi au dimanche : initiale pour les en-têtes, nom complet pour les lecteurs d'écran. */
export function weekdayLabels(locale: Locale): { short: string; long: string }[] {
  // Le 5 janvier 2026 est un lundi.
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 0, 5 + index));
    const format = (weekday: 'narrow' | 'long') => new Intl.DateTimeFormat(intlLocale[locale], { weekday, timeZone: 'UTC' }).format(date);
    return { short: format('narrow'), long: format('long') };
  });
}
