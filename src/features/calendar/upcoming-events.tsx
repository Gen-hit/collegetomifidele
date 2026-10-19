'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Notice } from '@/components/ui/notice';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';
import { useToday } from '@/lib/hooks';
import { tones } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { categoryIcon } from './categories';
import { DateTile } from './date-tile';
import { categoryTone, countdown, upcomingItems, type CalendarItem } from './dates';

type UpcomingEventsProps = {
  items: CalendarItem[];
  /** Nombre de dates affichées. */
  count?: number;
  labels: Dictionary['pages']['calendar']['next'];
  categories: Dictionary['pages']['calendar']['categories'];
  /**
   * Adresse de la page du calendrier ('/fr/calendar/') quand le bloc est affiché sur une autre page.
   * Sur la page du calendrier elle-même, laisser vide : le lien fait défiler jusqu'à la date.
   */
  calendarHref?: string;
  /** Jour de construction du site (voir useToday). */
  buildDate: string;
  /** En colonne (à côté d'un autre bloc) ou en rangée de cartes. */
  layout?: 'row' | 'column';
};

/** Les prochaines dates du calendrier, calculées à partir de la date du jour chez le visiteur. */
export function UpcomingEvents({ items, count = 3, labels, categories, calendarHref, buildDate, layout = 'row' }: UpcomingEventsProps) {
  const today = useToday(buildDate);
  const next = upcomingItems(items, today, count);

  if (next.length === 0) return <Notice className="max-w-3xl">{labels.empty}</Notice>;

  return (
    <ol className={cn('grid gap-4', layout === 'row' && 'xl:grid-cols-3')}>
      {next.map((item, index) => {
        const tone = categoryTone[item.category];
        const Icon = categoryIcon[item.category];
        const when = countdown(item, today);
        const badge = when.kind === 'days' ? fill(labels.inDays, { count: when.days }) : labels[when.kind];
        const soon = when.kind !== 'days';
        const content = (
          <>
            <DateTile weekday={item.weekday} day={item.day} month={item.month} until={item.until} tone={tone} />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-5 font-semibold">
                <span className={cn('rounded-md px-2', soon ? 'bg-gold-400 text-ink' : 'bg-surface-alt text-muted')}>{badge}</span>
                <span className={cn('inline-flex items-center gap-1.5', tones[tone].text)}>
                  <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                  {categories[item.category]}
                </span>
              </span>
              <span className="font-display text-lg leading-6 font-semibold text-pretty text-navy-700">{item.title}</span>
              <span className="text-[15px] leading-6 text-muted">{item.dateLabel}</span>
            </span>
            <ArrowRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-blue-500 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </>
        );
        const className = cn(
          'group relative flex h-full items-start gap-4 overflow-hidden rounded-2xl border bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-card sm:p-5',
          index === 0 && layout === 'row' ? 'border-gold-400 shadow-card' : 'border-line',
        );
        return (
          <li key={item.id}>
            {calendarHref ? (
              <Link href={`${calendarHref}#evt-${item.id}`} className={className}>
                {content}
              </Link>
            ) : (
              <a href={`#evt-${item.id}`} className={className}>
                {content}
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
}
