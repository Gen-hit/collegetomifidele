import type { CalendarCategory } from '@content/calendar';
import { daysBetween } from '@/lib/ics';
import type { Tone } from '@/lib/tones';

/**
 * Une date du calendrier, prête à afficher : les libellés sont préparés à la construction du site,
 * pour que le navigateur du visiteur n'ait rien à calculer ni à traduire.
 */
export type CalendarItem = {
  id: string;
  category: CalendarCategory;
  title: string;
  note?: string;
  confirm: boolean;
  /** Premier et dernier jour, 'AAAA-MM-JJ'. Pour une seule journée, les deux sont identiques. */
  start: string;
  end: string;
  /** Mois de rattachement dans l'agenda : 'AAAA-MM'. */
  monthKey: string;
  /** Pastille de date : « lun. », « 7 », « sept. ». */
  weekday: string;
  day: string;
  month: string;
  /** Dernier jour d'une période, en abrégé : « 3 janv. ». */
  until?: string;
  /** La date en toutes lettres : « Lundi 7 septembre 2026 ». */
  dateLabel: string;
};

export type CalendarMonth = {
  /** 'AAAA-MM'. */
  key: string;
  year: number;
  /** De 1 (janvier) à 12 (décembre). */
  month: number;
  /** « Septembre 2026 », pour un titre. */
  label: string;
  /** « septembre 2026 », au milieu d'une phrase. */
  inline: string;
};

/**
 * Les quatre familles de couleur du calendrier. Dans la vue « Année », une case ne peut porter qu'une teinte :
 * les huit catégories sont donc regroupées, et chaque famille a aussi sa propre forme (plein, clair, cerclé).
 */
export const categoryTone: Record<CalendarCategory, Extract<Tone, 'blue' | 'navy' | 'gold' | 'green'>> = {
  term: 'blue',
  meeting: 'blue',
  evaluation: 'navy',
  exam: 'navy',
  holiday: 'gold',
  international: 'green',
  culture: 'green',
  openDay: 'green',
};

/** Quand plusieurs dates tombent le même jour, la case prend la teinte la plus utile à un parent. */
const tonePriority: Tone[] = ['gold', 'navy', 'blue', 'green'];

export function dominantTone(items: CalendarItem[]): Tone {
  const present = items.map((item) => categoryTone[item.category]);
  return tonePriority.find((tone) => present.includes(tone)) ?? 'blue';
}

export function isPast(item: Pick<CalendarItem, 'end'>, today: string): boolean {
  return item.end < today;
}

export function isOngoing(item: Pick<CalendarItem, 'start' | 'end'>, today: string): boolean {
  return item.start <= today && today <= item.end;
}

/** Les prochaines dates : celles en cours, puis celles à venir, dans l'ordre. */
export function upcomingItems<T extends Pick<CalendarItem, 'start' | 'end'>>(items: T[], today: string, count: number): T[] {
  return items.filter((item) => !isPast(item, today)).slice(0, count);
}

export type Countdown = { kind: 'ongoing' } | { kind: 'today' } | { kind: 'tomorrow' } | { kind: 'days'; days: number };

/** Dans combien de temps tombe une date : aujourd'hui, demain, dans N jours, ou déjà en cours. */
export function countdown(item: Pick<CalendarItem, 'start' | 'end'>, today: string): Countdown {
  const days = daysBetween(today, item.start);
  if (days === 0 && item.end === item.start) return { kind: 'today' };
  if (days <= 0) return { kind: 'ongoing' };
  if (days === 1) return { kind: 'tomorrow' };
  return { kind: 'days', days };
}

const pad = (value: number) => String(value).padStart(2, '0');

export function isoOf(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Les semaines d'un mois, du lundi au dimanche. Les cases hors du mois valent `null`.
 * monthWeeks(2026, 9) → [[null, 1, 2, 3, 4, 5, 6], [7, 8, …], …]
 */
export function monthWeeks(year: number, month: number): (number | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // getUTCDay : 0 = dimanche. On décale pour que la semaine commence le lundi.
  const offset = (first.getUTCDay() + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(offset).fill(null), ...Array.from({ length }, (_, index) => index + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

/** Pour chaque jour de l'année, les dates qui le couvrent : { '2026-12-25': [congés de Noël, Noël] }. */
export function indexByDay(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const index = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const length = daysBetween(item.start, item.end);
    const cursor = new Date(`${item.start}T00:00:00Z`);
    for (let step = 0; step <= length; step += 1) {
      const iso = cursor.toISOString().slice(0, 10);
      index.set(iso, [...(index.get(iso) ?? []), item]);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return index;
}
