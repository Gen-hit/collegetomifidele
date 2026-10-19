import { calendarCategories, type CalendarEvent } from '@content/calendar';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { typo } from '@/lib/format';
import { tones } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { categoryIcon } from './categories';
import { categoryTone } from './dates';

type PendingDatesProps = {
  id?: string;
  locale: Locale;
  events: CalendarEvent[];
  labels: Dictionary['pages']['calendar']['pending'];
  categories: Dictionary['pages']['calendar']['categories'];
};

/** Les événements annoncés dont la date n'est pas encore fixée, regroupés par catégorie. */
export function PendingDates({ id, locale, events, labels, categories }: PendingDatesProps) {
  if (events.length === 0) return null;
  const ordered = calendarCategories.flatMap((category) => events.filter((event) => event.category === category));

  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={labels.eyebrow} title={labels.title} intro={labels.intro} accent="gold" className="reveal" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((event) => {
            const tone = categoryTone[event.category];
            const Icon = categoryIcon[event.category];
            return (
              <li key={event.id} className="reveal flex items-start gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
                <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-[10px]', tones[tone].tile)}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className={cn('text-[13px] leading-5 font-semibold', tones[tone].text)}>{categories[event.category]}</p>
                  <h3 className="font-display text-lg leading-6 font-semibold text-pretty text-navy-700">{typo(event.title[locale], locale)}</h3>
                  <p className="text-[15px] leading-6 font-semibold">{labels.placeholder}</p>
                  {event.note ? <p className="text-sm leading-5 text-pretty text-muted">{typo(event.note[locale], locale)}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
