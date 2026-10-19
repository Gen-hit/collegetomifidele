import { ArrowRight, Printer } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { calendar } from '@content/calendar';
import { documentById, localize } from '@content/documents';
import { site } from '@content/site';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { AnchorNav } from '@/components/ui/anchor-nav';
import { ButtonLink, buttonClass } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CalendarActions } from '@/features/calendar/calendar-actions';
import { CalendarView } from '@/features/calendar/calendar-view';
import { calendarItems, calendarMonths, pendingEvents, weekdayLabels } from '@/features/calendar/events';
import { PendingDates } from '@/features/calendar/pending-dates';
import { UpcomingEvents } from '@/features/calendar/upcoming-events';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/calendar';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.calendar.meta);
}

/**
 * Calendrier scolaire : les prochaines dates, puis toute l'année en agenda ou en vue annuelle,
 * et enfin les dates encore à confirmer. Les dates viennent de content/calendar.ts.
 */
export default async function CalendarPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.calendar;
  const [nextId, boardId, pendingId] = t.toc.items.map((item) => item.id);

  const year = calendar.schoolYear;
  const items = calendarItems(locale, t.agenda.range);
  const pending = pendingEvents();
  const path = href(locale, PATH);
  const calendarName = `${site.name} ${year}`;
  // Le site est construit à l'avance : ce jour sert au premier affichage, puis la date du visiteur prend le relais.
  const buildDate = new Date().toISOString().slice(0, 10);
  const printable = documentById('calendrier-scolaire')?.file;

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={fill(t.hero.title, { year })}
        intro={t.hero.intro}
        tone="gold"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.campus.label, path: '/campus' },
            { label: dict.nav.calendar.label, path: PATH },
          ],
        }}
      >
        <CalendarActions
          items={items}
          labels={t.actions}
          shareLabels={dict.common.share}
          shareText={fill(t.hero.shareText, { year, school: site.name })}
          path={path}
          school={site.name}
          calendarName={calendarName}
          language={locale}
          year={year}
        />
      </PageHero>
      <AnchorNav label={t.toc.label} items={pending.length > 0 ? t.toc.items : t.toc.items.slice(0, 2)} />

      <section id={nextId} className="bg-surface-alt py-16 sm:py-20">
        <Container className="flex flex-col gap-8">
          <SectionHeading eyebrow={t.next.eyebrow} title={t.next.title} accent="gold" className="reveal" />
          <UpcomingEvents items={items} labels={t.next} categories={t.categories} buildDate={buildDate} />
        </Container>
      </section>

      <section id={boardId} className="py-16 sm:py-24">
        <Container className="flex flex-col gap-8">
          <SectionHeading eyebrow={fill(t.board.eyebrow, { year })} title={t.board.title} intro={t.board.intro} className="reveal" />
          <CalendarView
            items={items}
            months={calendarMonths(locale)}
            weekdays={weekdayLabels(locale)}
            labels={t}
            shareLabels={dict.common.share}
            path={path}
            school={site.name}
            calendarName={calendarName}
            language={locale}
            buildDate={buildDate}
          />
          <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p className="max-w-3xl text-sm leading-5 text-muted">
              <span className="font-semibold">{t.source.label} </span>
              {calendar.source[locale]} {t.source.note}
            </p>
            {printable ? (
              <a href={localize(printable, locale)} download className={buttonClass('secondary', 'min-h-11 shrink-0 self-start px-4 text-[15px] sm:self-center')}>
                <Printer aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                {t.actions.print}
              </a>
            ) : null}
          </div>
        </Container>
      </section>

      <PendingDates id={pendingId} locale={locale} events={pending} labels={t.pending} categories={t.categories} />

      <CtaBand title={t.cta.title} text={t.cta.text}>
        <ButtonLink href={href(locale, '/contact')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/news')} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
