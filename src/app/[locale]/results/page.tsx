import { ArrowRight, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resultsSource } from '@content/results';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { ResultsBoard } from '@/components/sections/results-board';
import { ResultsTable } from '@/components/sections/results-table';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Notice } from '@/components/ui/notice';
import { SectionHeading } from '@/components/ui/section-heading';
import { allExamStats, latestYear, overall, sortedSessions } from '@/features/results/stats';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fill, formatNumber, formatPercent } from '@/lib/format';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/results';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.results.meta);
}

/** Résultats aux examens : la dernière session en détail, puis l'historique. Les chiffres viennent de content/results.ts. */
export default async function ResultsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.results;
  const [sessionId, historyId] = t.toc.items.map((item) => item.id);

  const sessions = sortedSessions();
  const year = latestYear();
  const last = sessions.at(-1);
  const summary = last ? overall(last) : null;

  return (
    <>
      <PageHero
        {...t.hero}
        tone="green"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.programmes.label, path: '/programmes' },
            { label: dict.nav.results.label, path: PATH },
          ],
        }}
      />

      <section id={sessionId} className="bg-surface-alt py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow={t.latest.eyebrow}
            title={year ? fill(t.latest.title, { year }) : t.latest.titleEmpty}
            accent="green"
            className="reveal"
          />
          {year ? null : <Notice className="reveal max-w-3xl">{t.latest.empty}</Notice>}

          {/* Le chiffre qui résume la session. */}
          <div className="on-dark reveal relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-indigo-900 p-6 text-white sm:flex-row sm:items-center sm:gap-8 sm:p-10">
            <span aria-hidden="true" className="dot-grid absolute inset-y-0 right-0 w-40 text-sky-400 opacity-20" />
            <span aria-hidden="true" className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-ink">
              <Trophy className="size-7" strokeWidth={1.75} />
            </span>
            <div className="relative flex flex-col gap-1">
              <p className="text-[13px] leading-4 font-semibold tracking-[0.08em] text-sky-400 uppercase">{t.latest.overall}</p>
              <p className="font-display text-5xl leading-none font-bold text-gold-400 sm:text-6xl">
                {formatPercent(summary?.rate, locale, t.ratePlaceholder)}
              </p>
            </div>
            <p className="relative max-w-md sm:ml-auto">
              {fill(t.latest.overallNote, {
                passed: summary ? formatNumber(summary.passed, locale) : '[000]',
                registered: summary ? formatNumber(summary.registered, locale) : '[000]',
              })}
            </p>
          </div>

          <ResultsBoard locale={locale} labels={t} stats={allExamStats()} year={year} />

          <p className="reveal text-sm leading-5 text-muted">
            <span className="font-semibold">{t.source.label} </span>
            {resultsSource ? resultsSource[locale] : t.source.placeholder}
          </p>
        </Container>
      </section>

      <section id={historyId} className="py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.history.eyebrow} title={t.history.title} intro={t.history.intro} className="reveal" />
          <ResultsTable locale={locale} labels={t.history} sessions={sessions} />
        </Container>
      </section>

      <CtaBand title={t.cta.title} text={t.cta.text} tone="green" flushTop>
        <ButtonLink href={href(locale, '/admissions#preinscription')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/programmes')} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
