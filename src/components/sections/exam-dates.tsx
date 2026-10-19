import { CalendarDays, FileCheck, Info } from 'lucide-react';
import { admissions } from '@content/admissions';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { formatDate } from '@/lib/format';
import { toneCycle, tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

type ExamDatesProps = {
  id?: string;
  locale: Locale;
  exams: Dictionary['pages']['admissions']['exams'];
  documents: Dictionary['pages']['admissions']['documents'];
};

/** Concours d'entrée (dates de content/admissions.ts) et pièces du dossier, côte à côte. */
export function ExamDates({ id, locale, exams, documents }: ExamDatesProps) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <Container className="grid gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading eyebrow={exams.eyebrow} title={exams.title} intro={exams.intro} className="reveal" />
          <ul className="flex flex-col gap-3">
            {admissions.entranceExams.map((exam, index) => {
              const look = tones[toneCycle[index % toneCycle.length]];
              return (
                <li key={exam.id} className="reveal flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
                  <span aria-hidden="true" className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', look.tile)}>
                    <CalendarDays className="size-6" strokeWidth={1.75} />
                  </span>
                  <p className="flex flex-col">
                    <span className="text-sm leading-5 text-muted">{exam.label[locale]}</span>
                    <span className="font-display text-lg leading-6 font-semibold text-navy-700">
                      {formatDate(exam.date, locale, exams.datePlaceholder)}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="reveal flex items-start gap-3 text-[15px] leading-6 text-muted">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
            {exams.note}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <SectionHeading eyebrow={documents.eyebrow} title={documents.title} accent="green" className="reveal" />
          <ul className="reveal flex flex-col divide-y divide-line rounded-2xl border border-line bg-white px-5">
            {documents.items.map((item) => (
              <li key={item} className="flex items-start gap-3 py-4 font-semibold">
                <FileCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-green-700" strokeWidth={1.75} />
                {item}
              </li>
            ))}
          </ul>
          <p className="reveal flex items-start gap-3 text-[15px] leading-6 text-muted">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
            {documents.note}
          </p>
        </div>
      </Container>
    </section>
  );
}
