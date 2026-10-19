import type { Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { dateLook } from './looks';

type DateTileProps = {
  /** « lun. », « 7 », « sept. ». */
  weekday: string;
  day: string;
  month: string;
  /** Dernier jour d'une période : « 3 janv. ». */
  until?: string;
  tone: Tone;
  className?: string;
};

/**
 * Pastille de date d'un événement. Elle est décorative : la date complète est toujours écrite
 * en toutes lettres à côté, pour les lecteurs d'écran comme pour le partage.
 */
export function DateTile({ weekday, day, month, until, tone, className }: DateTileProps) {
  return (
    <div aria-hidden="true" className={cn('flex w-16 shrink-0 flex-col items-center gap-1', className)}>
      <div className={cn('flex w-full flex-col items-center rounded-xl px-1 py-2 text-center', dateLook[tone])}>
        <span className="text-xs leading-4 font-semibold tracking-[0.06em] uppercase">{weekday}</span>
        <span className="font-display text-[26px] leading-7 font-bold">{day}</span>
        <span className="text-[13px] leading-4 font-semibold">{month}</span>
      </div>
      {until ? <span className="text-[13px] leading-4 font-semibold whitespace-nowrap text-muted">→ {until}</span> : null}
    </div>
  );
}
