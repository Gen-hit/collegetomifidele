import { exams, type Session } from '@content/results';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

type ResultsTableProps = {
  locale: Locale;
  labels: Dictionary['pages']['results']['history'];
  /** Les sessions, de la plus ancienne à la plus récente. */
  sessions: Session[];
};

/**
 * Toutes les sessions dans un tableau : la version « chiffres » des cartes et des courbes.
 * La colonne la plus récente est à gauche ; sur petit écran, le tableau défile horizontalement.
 */
export function ResultsTable({ locale, labels, sessions }: ResultsTableProps) {
  if (sessions.length === 0) {
    return <p className="reveal rounded-2xl border border-dashed border-control bg-white p-6 text-center text-muted">{labels.empty}</p>;
  }
  const columns = [...sessions].reverse();

  return (
    <div className="reveal overflow-x-auto rounded-2xl border border-line bg-white" tabIndex={0} role="region" aria-label={labels.caption}>
      <table className="w-full min-w-max border-collapse text-left">
        <caption className="sr-only">{labels.caption}</caption>
        <thead>
          <tr className="bg-surface-alt text-[13px] leading-4 font-semibold tracking-[0.06em] text-muted uppercase">
            <th scope="col" className="sticky left-0 bg-surface-alt px-4 py-3.5 sm:px-5">
              {labels.examCol}
            </th>
            {columns.map((session, index) => (
              <th key={session.year} scope="col" className={cn('px-4 py-3.5 text-right sm:px-5', index === 0 && 'text-navy-700')}>
                {session.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {exams.map((exam) => (
            <tr key={exam.id}>
              <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-display text-base leading-6 font-semibold sm:px-5">
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true" className={cn('size-2.5 shrink-0 rounded-full', exam.section === 'francophone' ? 'bg-blue-500' : 'bg-green-700')} />
                  {exam.label}
                </span>
              </th>
              {columns.map((session, index) => {
                const result = session.results[exam.id];
                const valid = result && result.registered > 0 && result.passed >= 0 && result.passed <= result.registered;
                return (
                  <td key={session.year} className="px-4 py-3 text-right tabular-nums sm:px-5">
                    {valid ? (
                      <span className="flex flex-col">
                        <span className={cn('font-semibold', index === 0 && 'text-navy-700')}>
                          {formatPercent(result.passed / result.registered, locale, '')}
                        </span>
                        <span className="text-sm leading-5 text-muted">
                          {formatNumber(result.passed, locale)} / {formatNumber(result.registered, locale)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted">
                        <span aria-hidden="true">–</span>
                        <span className="sr-only">{labels.dash}</span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
