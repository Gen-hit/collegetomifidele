'use client';

import { CalendarRange, Eye, EyeOff, ListFilter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { calendarCategories, type CalendarCategory } from '@content/calendar';
import { FilterChips, type FilterOption } from '@/components/ui/filter-chips';
import { Notice } from '@/components/ui/notice';
import { Segmented } from '@/components/ui/segmented';
import { ShareMenu, type ShareLabels } from '@/components/ui/share-buttons';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';
import { useToday } from '@/lib/hooks';
import { tones } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { AgendaMenu } from './agenda-menu';
import { categoryIcon } from './categories';
import { DateTile } from './date-tile';
import { categoryTone, indexByDay, isPast, type CalendarItem, type CalendarMonth } from './dates';
import { YearGrid } from './year-grid';

type Filter = CalendarCategory | 'all';
type View = 'agenda' | 'year';

type CalendarViewProps = {
  items: CalendarItem[];
  months: CalendarMonth[];
  weekdays: { short: string; long: string }[];
  labels: Dictionary['pages']['calendar'];
  shareLabels: ShareLabels;
  /** Chemin de la page du calendrier : '/fr/calendar/'. */
  path: string;
  school: string;
  /** Nom donné à l'agenda dans les fichiers .ics, et langue des textes. */
  calendarName: string;
  language: string;
  /** Jour de construction du site, 'AAAA-MM-JJ' (voir useToday). */
  buildDate: string;
};

/**
 * Le calendrier interactif : filtres par catégorie, agenda mois par mois ou vue de l'année,
 * partage et ajout à l'agenda pour chaque date. Un lien « …/calendar/#evt-<id> » ouvre directement la date partagée.
 */
export function CalendarView({ items, months, weekdays, labels, shareLabels, path, school, calendarName, language, buildDate }: CalendarViewProps) {
  const today = useToday(buildDate);
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('agenda');
  const [showPast, setShowPast] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const visible = useMemo(() => (filter === 'all' ? items : items.filter((item) => item.category === filter)), [items, filter]);
  const days = useMemo(() => indexByDay(visible), [visible]);
  const pastCount = visible.filter((item) => isPast(item, today)).length;
  const shown = showPast ? visible : visible.filter((item) => !isPast(item, today));

  /** Amène une date à l'écran : on quitte le filtre ou la vue qui la masquerait. */
  const reveal = (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;
    setView('agenda');
    setFilter((current) => (current === 'all' || current === item.category ? current : 'all'));
    if (isPast(item, today)) setShowPast(true);
    setFocused(id);
  };

  // Un lien partagé (…/calendar/#evt-rentree) ou un clic sur « Prochaines dates » ouvre la date visée.
  useEffect(() => {
    const read = () => {
      const hash = decodeURIComponent(window.location.hash);
      if (hash.startsWith('#evt-')) reveal(hash.slice(5));
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
    // `reveal` ne dépend que de la liste des dates et du jour courant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, today]);

  // Une fois la date affichée, on fait défiler la page jusqu'à elle et on y place le clavier.
  useEffect(() => {
    if (!focused || view !== 'agenda') return;
    const element = document.getElementById(`evt-${focused}`);
    if (!element) return;
    element.scrollIntoView({ block: 'start' });
    element.focus({ preventScroll: true });
  }, [focused, view, showPast, filter]);

  const select = (id: string) => {
    window.history.replaceState(null, '', `#evt-${id}`);
    reveal(id);
  };

  const options: FilterOption<Filter>[] = [
    { value: 'all', label: labels.filters.all, count: items.length, Icon: ListFilter },
    ...calendarCategories
      .map((category) => ({ value: category as Filter, label: labels.categories[category], count: items.filter((item) => item.category === category).length, Icon: categoryIcon[category] }))
      .filter((option) => option.count > 0),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <FilterChips label={labels.filters.label} options={options} value={filter} onChange={setFilter} className="lg:flex-1" />
        <Segmented
          legend={labels.view.legend}
          name="calendar-view"
          value={view}
          onChange={setView}
          options={[
            { value: 'agenda', label: labels.view.agenda },
            { value: 'year', label: labels.view.year },
          ]}
          className="w-full shrink-0 sm:w-64 [&>legend]:sr-only"
        />
      </div>

      {view === 'year' ? (
        <YearGrid
          months={months}
          days={days}
          weekdays={weekdays}
          today={today}
          labels={{ ...labels.year, thisMonth: labels.agenda.thisMonth }}
          onSelect={select}
        />
      ) : (
        <div className="flex flex-col gap-10">
          {pastCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowPast((current) => !current)}
              aria-expanded={showPast}
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-line bg-white px-4 text-[15px] leading-5 font-semibold text-blue-600 transition-colors hover:border-blue-600 hover:bg-sky-100"
            >
              {showPast ? <EyeOff aria-hidden="true" className="size-4.5" strokeWidth={1.75} /> : <Eye aria-hidden="true" className="size-4.5" strokeWidth={1.75} />}
              {showPast ? labels.agenda.hidePast : fill(labels.agenda.showPast, { count: pastCount })}
            </button>
          ) : null}

          {shown.length === 0 ? <Notice className="max-w-3xl">{pastCount > 0 ? labels.next.empty : labels.agenda.empty}</Notice> : null}

          {months.map((month) => {
            const events = shown.filter((item) => item.monthKey === month.key);
            if (events.length === 0) return null;
            const current = today.startsWith(month.key);
            return (
              <section key={month.key} aria-labelledby={`mois-${month.key}`} className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-8">
                <div className="flex items-center gap-3 lg:sticky lg:top-28 lg:flex-col lg:items-start lg:gap-2 lg:self-start">
                  <h3 id={`mois-${month.key}`} className="flex items-center gap-2 font-display text-2xl leading-8 font-bold text-navy-700">
                    <CalendarRange aria-hidden="true" className="size-6 shrink-0 text-gold-400 lg:hidden" strokeWidth={1.75} />
                    {month.label}
                  </h3>
                  {current ? (
                    <span className="rounded-md bg-gold-100 px-2 py-1 text-xs leading-4 font-semibold tracking-[0.06em] text-gold-700 uppercase">
                      {labels.agenda.thisMonth}
                    </span>
                  ) : null}
                </div>
                <ol className="flex flex-col gap-3">
                  {events.map((item) => {
                    const tone = categoryTone[item.category];
                    const Icon = categoryIcon[item.category];
                    const eventPath = `${path}#evt-${item.id}`;
                    return (
                      <li
                        key={item.id}
                        id={`evt-${item.id}`}
                        tabIndex={-1}
                        className={cn(
                          'flex scroll-mt-4 flex-col gap-4 rounded-2xl border bg-white p-4 outline-none transition-[border-color,box-shadow] duration-300 sm:flex-row sm:items-center sm:p-5',
                          focused === item.id ? 'border-gold-400 shadow-card ring-4 ring-gold-100' : 'border-line',
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <DateTile weekday={item.weekday} day={item.day} month={item.month} until={item.until} tone={tone} />
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-5 font-semibold">
                              <span className={cn('inline-flex items-center gap-1.5', tones[tone].text)}>
                                <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                                {labels.categories[item.category]}
                              </span>
                              {item.confirm ? <span className="rounded-md bg-gold-100 px-2 text-gold-700">{labels.agenda.confirm}</span> : null}
                              {isPast(item, today) ? <span className="rounded-md bg-surface-alt px-2 text-muted">{labels.agenda.past}</span> : null}
                            </p>
                            <h4 className="font-display text-lg leading-6 font-semibold text-pretty text-navy-700">{item.title}</h4>
                            <p className="text-[15px] leading-6">{item.dateLabel}</p>
                            {item.note ? <p className="text-[15px] leading-6 text-pretty text-muted">{item.note}</p> : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2 pl-20 sm:pl-0">
                          <ShareMenu
                            path={eventPath}
                            title={item.title}
                            text={fill(labels.actions.shareText, { title: item.title, date: item.dateLabel, school })}
                            labels={shareLabels}
                            ariaLabel={fill(labels.actions.shareEvent, { title: item.title })}
                          />
                          <AgendaMenu
                            event={{ id: item.id, title: item.title, start: item.start, end: item.end, description: item.note, location: school }}
                            path={eventPath}
                            labels={labels.actions}
                            ariaLabel={fill(labels.actions.agendaEvent, { title: item.title })}
                            calendarName={calendarName}
                            language={language}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
