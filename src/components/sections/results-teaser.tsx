import { ArrowRight, Trophy } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { accentOf, SectionHeading } from '@/components/ui/section-heading';
import { toneCycle, tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

type ResultsTeaserProps = {
  id?: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Un examen par carte : son libellé et son taux (ou un emplacement). Voir `resultItems()`. */
  items: { label: string; value: string }[];
  link: { label: string; href: string };
  /** Couleur dominante : celle de la section sur les pages francophone et anglophone. */
  tone?: Tone;
  alt?: boolean;
};

/** Aperçu des résultats aux examens, avec un lien vers la page complète. Les taux viennent de content/results.ts. */
export function ResultsTeaser({ id, eyebrow, title, text, items, link, tone, alt = false }: ResultsTeaserProps) {
  // Quatre examens : 2 × 2 sur téléphone. Trois : une colonne, pour ne pas laisser une carte seule sur sa ligne.
  const columns = items.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-3';

  return (
    <section id={id} className={cn('py-16 sm:py-24', alt && 'bg-surface-alt')}>
      <Container className="flex flex-col gap-10">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} intro={text} accent={accentOf(tone ?? 'green')} />
          <ButtonLink href={link.href} variant="secondary">
            {link.label}
            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
          </ButtonLink>
        </div>
        <ul className={cn('grid gap-3 lg:gap-4', columns)}>
          {items.map(({ label, value }, index) => {
            const look = tones[tone ?? toneCycle[index % toneCycle.length]];
            return (
              <li key={label} className="reveal relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-white p-5 sm:p-6">
                <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', look.bar)} />
                <span aria-hidden="true" className={cn('flex size-11 items-center justify-center rounded-[10px]', look.tile)}>
                  <Trophy className="size-5" strokeWidth={1.75} />
                </span>
                <p className={cn('font-display text-3xl leading-9 font-bold', look.text)}>{value}</p>
                <p className="text-sm leading-5 text-muted">{label}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
