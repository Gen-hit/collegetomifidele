import { Award, Info } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { tones, trackTone, type Track } from '@/lib/tones';
import { cn } from '@/lib/utils';

const trackLang: Record<string, string> = { francophone: 'fr', anglophone: 'en' };

type DiplomaColumnsProps = {
  id?: string;
  eyebrow: string;
  title: string;
  columns: { track: string; title: string; items: { exam: string; when: string }[] }[];
  note: string;
};

/** Les examens préparés, une colonne par section, à la couleur de la section. */
export function DiplomaColumns({ id, eyebrow, title, columns, note }: DiplomaColumnsProps) {
  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={eyebrow} title={title} accent="gold" className="reveal" />
        <div className="grid gap-5 md:grid-cols-2">
          {columns.map((column) => {
            const look = tones[trackTone[column.track as Track] ?? 'blue'];
            return (
              <div key={column.track} className="reveal flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
                <h3 lang={trackLang[column.track]} className={cn('flex items-center gap-3 px-6 py-4 font-display text-xl leading-7 font-bold', look.soft, look.text)}>
                  <span aria-hidden="true" className={cn('h-6 w-1.5 rounded-full', look.bar)} />
                  {column.title}
                </h3>
                <ul className="flex flex-col divide-y divide-line px-6">
                  {column.items.map((item) => (
                    <li key={item.exam} className="flex items-start gap-3 py-4">
                      <span aria-hidden="true" className={cn('flex size-10 shrink-0 items-center justify-center rounded-[10px]', look.tile)}>
                        <Award className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="flex flex-col">
                        <span className="font-display text-lg leading-6 font-semibold text-navy-700">{item.exam}</span>
                        <span className="text-[15px] leading-6 text-muted">{item.when}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="reveal flex max-w-3xl items-start gap-3 text-[15px] leading-6 text-muted">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
          {note}
        </p>
      </Container>
    </section>
  );
}
