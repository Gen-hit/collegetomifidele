import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Meter } from '@/components/ui/meter';
import { Sparkline } from '@/components/ui/sparkline';
import type { ExamStat } from '@/features/results/stats';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Couleur de chaque section : bleu pour les examens francophones, vert pour les anglophones. */
const looks = {
  francophone: { tone: 'blue', bar: 'bg-blue-500', accent: '#0f70b7', lang: 'fr' },
  anglophone: { tone: 'green', bar: 'bg-green-700', accent: '#076633', lang: 'en' },
} as const;

type ResultsBoardProps = {
  locale: Locale;
  labels: Dictionary['pages']['results'];
  stats: ExamStat[];
  /** Année de la dernière session, pour signaler un examen non présenté cette année-là. */
  year: number | null;
};

function Delta({ stat, labels, locale }: { stat: ExamStat; labels: ResultsBoardProps['labels']; locale: Locale }) {
  const previous = stat.history.at(-2);
  if (stat.delta === null || !previous) return null;
  const points = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Math.abs(Math.round(stat.delta * 10) / 10));
  // Une variation de moins d'un dixième de point est affichée comme une stabilité.
  const direction = Math.abs(stat.delta) < 0.05 ? 'same' : stat.delta > 0 ? 'up' : 'down';
  const look = {
    up: { Icon: TrendingUp, text: labels.deltaUp, color: 'text-green-700' },
    down: { Icon: TrendingDown, text: labels.deltaDown, color: 'text-red-700' },
    same: { Icon: Minus, text: labels.deltaSame, color: 'text-muted' },
  }[direction];
  return (
    <p className={cn('flex items-center gap-1.5 text-sm leading-5 font-semibold', look.color)}>
      <look.Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
      {fill(look.text, { points, year: previous.year })}
    </p>
  );
}

/**
 * Les résultats de la dernière session, un bloc par section et une carte par examen :
 * taux, admis sur inscrits, jauge, évolution et courbe. Sans donnée, les cartes montrent des emplacements.
 */
export function ResultsBoard({ locale, labels, stats, year }: ResultsBoardProps) {
  return (
    <div className="flex flex-col gap-10">
      {(['francophone', 'anglophone'] as const).map((section) => {
        const look = looks[section];
        const group = stats.filter((stat) => stat.exam.section === section);
        if (group.length === 0) return null;
        return (
          <div key={section} className="reveal flex flex-col gap-4">
            <h3 lang={look.lang} className="flex items-center gap-3 font-display text-xl leading-7 font-bold text-navy-700">
              <span aria-hidden="true" className={cn('h-6 w-1.5 rounded-full', look.bar)} />
              {labels.sections[section]}
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {group.map((stat) => {
                const latest = stat.latest;
                const stale = latest !== null && year !== null && latest.year !== year;
                return (
                  <li key={stat.exam.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-display text-lg leading-6 font-semibold">{stat.exam.label}</h4>
                      {latest ? <span className="text-sm leading-5 text-muted">{fill(labels.session, { year: latest.year })}</span> : null}
                    </div>
                    <p className="font-display text-4xl leading-none font-bold text-navy-700">
                      {formatPercent(latest?.rate, locale, labels.ratePlaceholder)}
                    </p>
                    <Meter ratio={latest?.rate ?? null} tone={look.tone} label={`${labels.rateOf} · ${stat.exam.label}`} />
                    <p className="text-sm leading-5 text-muted">
                      {latest
                        ? fill(labels.passed, { passed: formatNumber(latest.passed, locale), registered: formatNumber(latest.registered, locale) })
                        : labels.countsPlaceholder}
                    </p>
                    {stale ? <p className="text-sm leading-5 text-muted">{fill(labels.notSat, { year })}</p> : null}
                    <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
                      <Delta stat={stat} labels={labels} locale={locale} />
                      {stat.history.length >= 2 ? (
                        <Sparkline
                          accent={look.accent}
                          label={fill(labels.trend, { from: stat.history[0].year, to: stat.history.at(-1)?.year ?? '' })}
                          points={stat.history.map((point) => ({
                            label: String(point.year),
                            value: point.rate,
                            text: formatPercent(point.rate, locale, ''),
                          }))}
                        />
                      ) : (
                        <p className="text-sm leading-5 text-muted">{labels.trendPending}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
