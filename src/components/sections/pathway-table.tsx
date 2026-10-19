import { GraduationCap, Info } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/utils';

type PathwayTableProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro: string;
  /** Titre du tableau, lu par les lecteurs d'écran. */
  caption: string;
  year: string;
  /** Abréviation affichée sur téléphone : « An », « Yr ». */
  yearShort: string;
  fr: string;
  en: string;
  /** Mot lu avant le nom d'un examen : « Examen », « Examination ». */
  examWord: string;
  rows: { fr: string; frExam: string; en: string; enExam: string }[];
  note: string;
};

function ClassCell({ name, exam, examWord, lang, badge }: { name: string; exam: string; examWord: string; lang: string; badge: string }) {
  return (
    <td lang={lang} className="px-2.5 py-3 align-middle sm:px-5">
      <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="font-display text-lg leading-6 font-semibold text-navy-700">{name}</span>
        {exam ? (
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-4 font-semibold whitespace-nowrap text-white', badge)}>
            <GraduationCap aria-hidden="true" className="hidden size-3.5 shrink-0 sm:block" strokeWidth={2} />
            <span className="sr-only">{examWord} : </span>
            {exam}
          </span>
        ) : null}
      </div>
    </td>
  );
}

/**
 * Correspondance des classes entre les deux sous-systèmes, année par année, avec les examens officiels.
 * Les noms de classes restent dans leur langue d'origine.
 */
export function PathwayTable({ id, eyebrow, title, intro, caption, year, yearShort, fr, en, examWord, rows, note }: PathwayTableProps) {
  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="reveal flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} accent="green" />
          <p className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-[15px] leading-6 text-muted">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
            {note}
          </p>
        </div>
        <div className="reveal overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="text-[13px] leading-4 font-semibold tracking-[0.06em] uppercase">
                <th scope="col" className="w-12 bg-surface-alt px-1 py-4 text-center text-muted sm:w-24 sm:px-2">
                  <span className="sm:hidden" aria-hidden="true">
                    {yearShort}
                  </span>
                  <span className="sr-only sm:not-sr-only">{year}</span>
                </th>
                <th scope="col" lang="fr" className="border-b-3 border-blue-500 bg-sky-100 px-2.5 py-4 text-blue-600 sm:px-5">
                  {fr}
                </th>
                <th scope="col" lang="en" className="border-b-3 border-green-700 bg-green-100 px-2.5 py-4 text-green-700 sm:px-5">
                  {en}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, index) => (
                <tr key={row.fr} className="transition-colors hover:bg-gold-100/60">
                  <th scope="row" className="bg-surface-alt px-1 py-3 text-center sm:px-2">
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-navy-700 font-display text-base leading-none font-bold text-white">
                      <span className="sr-only">{year} </span>
                      {index + 1}
                    </span>
                  </th>
                  <ClassCell name={row.fr} exam={row.frExam} examWord={examWord} lang="fr" badge="bg-blue-600" />
                  <ClassCell name={row.en} exam={row.enExam} examWord={examWord} lang="en" badge="bg-green-700" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
