import { Cog, Cpu, PencilRuler, Ruler, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { toneCycle, tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

/** Pictogrammes génériques, en attendant la liste réelle des spécialités. */
const icons: LucideIcon[] = [Wrench, Zap, PencilRuler, Cog, Cpu, Ruler];

type SpecialityGridProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro: string;
  fieldLabel: string;
  diplomaLabel: string;
  items: { name: string; field: string; diploma: string }[];
};

/** Les spécialités de l'enseignement technique : une carte par spécialité, avec son domaine et son diplôme. */
export function SpecialityGrid({ id, eyebrow, title, intro, fieldLabel, diplomaLabel, items }: SpecialityGridProps) {
  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} accent="gold" className="reveal" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const look = tones[toneCycle[index % toneCycle.length]];
            const Icon = icons[index % icons.length];
            return (
              <li
                key={item.name}
                className="group reveal relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1 bg-transparent transition-colors', look.hoverBar)} />
                <div className="flex items-center gap-4">
                  <span aria-hidden="true" className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', look.tile)}>
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display text-xl leading-7 font-semibold">{item.name}</h3>
                </div>
                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-[15px] leading-6">
                  <div className="flex flex-col">
                    <dt className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{fieldLabel}</dt>
                    <dd className="font-semibold">{item.field}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{diplomaLabel}</dt>
                    <dd className="font-semibold">{item.diploma}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
