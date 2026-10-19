import type { ReactNode } from 'react';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

type ChipProps = {
  children: ReactNode;
  tone?: Tone;
  /** Sur un bandeau sombre : contour clair, texte blanc. */
  onDark?: boolean;
  lang?: string;
  className?: string;
};

/** Étiquette arrondie : niveau, filière, spécialité. */
export function Chip({ children, tone = 'blue', onDark = false, lang, className }: ChipProps) {
  return (
    <span
      lang={lang}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-[13px] leading-4 font-semibold tracking-[0.04em]',
        onDark ? 'border border-white/30 bg-white/10 text-white' : tones[tone].badge,
        className,
      )}
    >
      {children}
    </span>
  );
}
