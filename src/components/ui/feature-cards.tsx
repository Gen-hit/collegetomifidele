import type { LucideIcon } from 'lucide-react';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type FeatureCard = { title: string; text: string; Icon: LucideIcon; tone: Tone };

const grids = {
  3: 'md:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

type FeatureCardsProps = {
  items: FeatureCard[];
  columns?: keyof typeof grids;
  /** Affiche « 01 », « 02 »… en filigrane, pour une suite d'étapes ou de valeurs. */
  numbered?: boolean;
  className?: string;
};

/** Grille de cartes à pictogramme coloré : atouts, valeurs, étapes, engagements. */
export function FeatureCards({ items, columns = 4, numbered = false, className }: FeatureCardsProps) {
  return (
    <ul className={cn('grid gap-4', grids[columns], className)}>
      {items.map(({ title, text, Icon, tone }, index) => (
        <li
          key={title}
          className="group reveal relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card"
        >
          <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1 bg-transparent transition-colors', tones[tone].hoverBar)} />
          {numbered ? (
            <span aria-hidden="true" className="absolute top-4 right-5 font-display text-4xl leading-none font-bold text-line">
              {String(index + 1).padStart(2, '0')}
            </span>
          ) : null}
          <span aria-hidden="true" className={cn('flex size-12 items-center justify-center rounded-xl', tones[tone].tile)}>
            <Icon className="size-6" strokeWidth={1.75} />
          </span>
          <h3 className="font-display text-xl leading-7 font-semibold">{title}</h3>
          <p className="text-[15px] leading-6 text-muted">{text}</p>
        </li>
      ))}
    </ul>
  );
}
