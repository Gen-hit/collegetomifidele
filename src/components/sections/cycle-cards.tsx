import { GraduationCap } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Container } from '@/components/ui/container';
import { accentOf, SectionHeading } from '@/components/ui/section-heading';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

type Cycle = {
  /** 'general' ou 'technical' : le technique est toujours en doré. */
  kind: string;
  track: string;
  title: string;
  classes: string[];
  exam: string;
  text: string;
};

type CycleCardsProps = {
  id?: string;
  eyebrow: string;
  title: string;
  examLabel: string;
  items: Cycle[];
  /** Couleur de la section : bleu (francophone) ou vert (anglophone). */
  tone: Tone;
  /** Langue des noms de classes : ils restent dans la langue de la section. */
  classLang: string;
};

/** Les cycles de formation d'une section : classes, examen préparé et contenu de chaque cycle. */
export function CycleCards({ id, eyebrow, title, examLabel, items, tone, classLang }: CycleCardsProps) {
  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={eyebrow} title={title} accent={accentOf(tone)} className="reveal" />
        <ol className="grid gap-5 md:grid-cols-2">
          {items.map((cycle, index) => {
            const cardTone: Tone = cycle.kind === 'technical' ? 'gold' : tone;
            const look = tones[cardTone];
            return (
              <li
                key={`${cycle.kind}-${cycle.title}`}
                className="group reveal relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card sm:p-8"
              >
                <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1.5', look.bar)} />
                <span aria-hidden="true" className="absolute top-5 right-6 font-display text-5xl leading-none font-bold text-line">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-2 pr-14">
                  <span className={cn('self-start rounded-md px-2 py-1 text-xs leading-4 font-semibold tracking-[0.06em] uppercase', look.badge)}>
                    {cycle.track}
                  </span>
                  <h3 className="font-display text-2xl leading-8 font-bold text-navy-700">{cycle.title}</h3>
                </div>
                <ul lang={classLang} className="flex flex-wrap gap-2">
                  {cycle.classes.map((name) => (
                    <li key={name}>
                      <Chip tone={cardTone}>{name}</Chip>
                    </li>
                  ))}
                </ul>
                <p className="text-[15px] leading-6 text-muted">{cycle.text}</p>
                <p className="mt-auto flex items-start gap-3 rounded-xl bg-surface-alt p-4">
                  <span aria-hidden="true" className={cn('flex size-10 shrink-0 items-center justify-center rounded-[10px]', look.tile)}>
                    <GraduationCap className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{examLabel}</span>
                    <span className="font-semibold">{cycle.exam}</span>
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
