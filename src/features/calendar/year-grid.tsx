'use client';

import { fill } from '@/lib/format';
import type { Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { dominantTone, isoOf, monthWeeks, type CalendarItem, type CalendarMonth } from './dates';
import { dateLook } from './looks';

type YearGridProps = {
  months: CalendarMonth[];
  /** Pour chaque jour 'AAAA-MM-JJ', les dates qui le couvrent (voir indexByDay). */
  days: Map<string, CalendarItem[]>;
  weekdays: { short: string; long: string }[];
  today: string;
  labels: { hint: string; legendTitle: string; legend: Record<'blue' | 'navy' | 'gold' | 'green', string>; today: string; dayLabel: string; thisMonth: string };
  /** Le visiteur a touché un jour : on lui montre cette date dans l'agenda. */
  onSelect: (id: string) => void;
};

const legendOrder: Tone[] = ['gold', 'navy', 'blue', 'green'];
const cellClass = 'mx-auto flex aspect-square w-full max-w-10 items-center justify-center rounded-lg text-sm leading-5 tabular-nums';
/** Aujourd'hui : un point sous le numéro du jour. */
const todayMark = "relative after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current after:content-['']";

/**
 * L'année scolaire d'un seul regard : un petit calendrier par mois, les jours qui portent une date sont colorés.
 * Toucher un jour coloré ouvre l'agenda sur cette date.
 */
export function YearGrid({ months, days, weekdays, today, labels, onSelect }: YearGridProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <p className="text-[15px] leading-6 text-muted">{labels.hint}</p>
        <ul aria-label={labels.legendTitle} className="flex flex-wrap gap-x-5 gap-y-2 text-sm leading-5 font-semibold">
          {legendOrder.map((tone) => (
            <li key={tone} className="flex items-center gap-2">
              <span aria-hidden="true" className={cn('size-5 shrink-0 rounded-md', dateLook[tone])} />
              {labels.legend[tone as 'blue' | 'navy' | 'gold' | 'green']}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className={cn('flex size-5 shrink-0 items-end justify-center rounded-md border border-line text-ink', todayMark)} />
            {labels.today}
          </li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map((month) => {
          const current = today.startsWith(month.key);
          return (
            <table
              key={month.key}
              className={cn(
                'w-full table-fixed border-separate border-spacing-1 rounded-2xl border bg-white p-3 text-center',
                current ? 'border-gold-400 shadow-card' : 'border-line',
              )}
            >
              <caption className="px-1 pb-2 text-left font-display text-lg leading-6 font-semibold text-navy-700">
                <span className="flex items-center justify-between gap-2">
                  {month.label}
                  {current ? (
                    <span className="rounded-md bg-gold-100 px-2 py-0.5 font-sans text-xs leading-4 font-semibold tracking-[0.06em] text-gold-700 uppercase">
                      {labels.thisMonth}
                    </span>
                  ) : null}
                </span>
              </caption>
              <thead>
                <tr>
                  {weekdays.map((weekday) => (
                    <th key={weekday.long} scope="col" abbr={weekday.long} className="pb-1 text-xs leading-4 font-semibold text-muted">
                      <span aria-hidden="true">{weekday.short}</span>
                      <span className="sr-only">{weekday.long}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthWeeks(month.year, month.month).map((week, index) => (
                  <tr key={index}>
                    {week.map((day, column) => {
                      if (day === null) return <td key={column} />;
                      const iso = isoOf(month.year, month.month, day);
                      const events = days.get(iso);
                      const isToday = iso === today;
                      if (!events) {
                        return (
                          <td key={column} className="p-0">
                            <span className={cn(cellClass, 'text-muted', isToday && todayMark, isToday && 'font-semibold text-ink')}>{day}</span>
                          </td>
                        );
                      }
                      const names = events.map((event) => event.title).join(', ');
                      return (
                        <td key={column} className="p-0">
                          <button
                            type="button"
                            onClick={() => onSelect(events[0].id)}
                            title={names}
                            aria-label={fill(labels.dayLabel, { date: `${day} ${month.inline}`, events: names })}
                            className={cn(cellClass, 'font-semibold transition-transform hover:scale-110', dateLook[dominantTone(events)], isToday && todayMark)}
                          >
                            {day}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })}
      </div>
    </div>
  );
}
