import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { RichTitle, type Highlight } from '@/components/ui/section-heading';
import { cn } from '@/lib/utils';

const looks = {
  gold: { box: 'bg-gold-100', disc: 'bg-gold-400', dots: 'text-gold-700', highlight: 'gold' },
  blue: { box: 'bg-sky-100', disc: 'bg-sky-400', dots: 'text-blue-500', highlight: 'blue' },
  green: { box: 'bg-green-100', disc: 'bg-green-700', dots: 'text-green-700', highlight: 'green' },
} as const satisfies Record<string, { box: string; disc: string; dots: string; highlight: Highlight }>;

type CtaBandProps = {
  /** Les mots entre accolades prennent la couleur du bloc. */
  title: string;
  text: string;
  tone?: keyof typeof looks;
  /** À activer quand la section précédente est sur fond blanc et porte déjà sa marge basse. */
  flushTop?: boolean;
  /** Les boutons d'action. */
  children: ReactNode;
};

/** Dernier bloc d'une page : un appel à l'action sur fond teinté, avec un disque de couleur en décor. */
export function CtaBand({ title, text, tone = 'gold', flushTop = false, children }: CtaBandProps) {
  const look = looks[tone];

  return (
    <section className={cn('pb-16 sm:pb-24', flushTop ? '' : 'pt-16 sm:pt-24')}>
      <Container>
        <div className={cn('reveal relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-14', look.box)}>
          <div aria-hidden="true" className={cn('absolute -top-14 -right-14 size-32 rounded-full sm:-top-10 sm:-right-10 sm:size-40', look.disc)} />
          <div aria-hidden="true" className={cn('dot-grid absolute right-24 bottom-0 h-24 w-40 opacity-30', look.dots)} />
          <div className="relative flex max-w-2xl flex-col gap-4 pt-6 sm:pt-0">
            <h2 className="font-display text-[1.7rem] leading-[1.2] font-bold text-balance text-navy-700 sm:text-4xl">
              <RichTitle text={title} highlight={look.highlight} />
            </h2>
            <p className="text-pretty">{text}</p>
            <div className="mt-2 flex flex-wrap gap-3">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
