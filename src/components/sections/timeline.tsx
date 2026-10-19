import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { toneCycle, tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

type TimelineProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  steps: { year: string; title: string; text: string }[];
};

/** Frise chronologique verticale : une date, un titre et une phrase par étape. */
export function Timeline({ id, eyebrow, title, intro, steps }: TimelineProps) {
  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} accent="gold" className="reveal lg:sticky lg:top-28 lg:self-start" />
        <ol className="relative flex flex-col gap-4">
          {/* Le trait qui relie les étapes. */}
          <span aria-hidden="true" className="absolute top-3 bottom-3 left-2.75 w-0.5 rounded-full bg-sky-200" />
          {steps.map((step, index) => {
            const tone = tones[toneCycle[index % toneCycle.length]];
            return (
              <li key={`${step.title}-${index}`} className="reveal relative pl-10">
                <span aria-hidden="true" className={cn('absolute top-6 left-0 size-6 rounded-full border-4 border-surface-alt', tone.bar)} />
                <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-card sm:p-6">
                  <p className={cn('font-display text-2xl leading-8 font-bold', tone.text)}>{step.year}</p>
                  <h3 className="font-display text-xl leading-7 font-semibold">{step.title}</h3>
                  <p className="text-[15px] leading-6 text-muted">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
