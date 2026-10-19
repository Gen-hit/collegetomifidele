import type { ReactNode } from 'react';
import type { Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

const highlights = {
  blue: 'text-blue-500',
  green: 'text-green-700',
  gold: 'text-gold-700',
  /** Sur fond sombre. */
  goldOnDark: 'text-gold-400',
  skyOnDark: 'text-sky-400',
  greenOnDark: 'text-green-300',
  /** Accroche de l'accueil : mot en bleu, souligné d'un trait doré. */
  mark: 'text-blue-500 underline decoration-gold-400 decoration-4 underline-offset-6',
} as const;

export type Highlight = keyof typeof highlights;

/**
 * Affiche un titre dont les mots entre accolades sont mis en couleur :
 * "La vie du {collège}" → « collège » prend la couleur d'accent.
 */
export function RichTitle({ text, highlight = 'blue' }: { text: string; highlight?: Highlight }) {
  const parts = text.split(/(\{[^}]+\})/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('{') ? (
          // Un mot seul ne se coupe pas : « 2026-2027 » reste sur une ligne, même sur un petit écran.
          <span key={index} className={cn(highlights[highlight], !part.includes(' ') && 'whitespace-nowrap')}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

const bars = {
  blue: 'bg-blue-500',
  green: 'bg-green-700',
  gold: 'bg-gold-400',
  sky: 'bg-sky-400',
} as const;

/** Le surtitre prend la couleur de la section : bleu, vert ou doré. */
const eyebrows = {
  blue: 'text-blue-600',
  green: 'text-green-700',
  gold: 'text-gold-700',
  sky: 'text-blue-600',
} as const;

export type Accent = keyof typeof bars;

/** Convertit une teinte du site en couleur de titre de section. */
export function accentOf(tone: Tone): Accent {
  return tone === 'navy' ? 'blue' : tone;
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  /** Couleur du filet et du mot mis en avant. */
  accent?: Accent;
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2';
  className?: string;
};

/** Surtitre avec filet coloré, titre et introduction d'une section. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  accent = 'blue',
  tone = 'light',
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  const dark = tone === 'dark';
  const highlight: Highlight = dark
    ? accent === 'gold'
      ? 'goldOnDark'
      : 'skyOnDark'
    : accent === 'sky'
      ? 'blue'
      : accent;

  return (
    <div className={cn('flex max-w-2xl flex-col gap-3', className)}>
      <p
        className={cn(
          'flex items-center gap-3 text-[13px] leading-4 font-semibold tracking-[0.08em] uppercase',
          dark ? 'text-sky-400' : eyebrows[accent],
        )}
      >
        <span aria-hidden="true" className={cn('h-0.5 w-8 rounded-full', bars[accent])} />
        {eyebrow}
      </p>
      <Tag
        className={cn(
          'font-display text-[1.7rem] leading-[1.2] font-bold text-balance sm:text-4xl',
          dark ? 'text-white' : 'text-navy-700',
        )}
      >
        <RichTitle text={title} highlight={highlight} />
      </Tag>
      {intro ? <p className={cn('text-pretty', dark ? 'text-white' : 'text-ink')}>{intro}</p> : null}
    </div>
  );
}
