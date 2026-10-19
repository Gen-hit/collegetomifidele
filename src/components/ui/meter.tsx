import { cn } from '@/lib/utils';

/** Remplissage et piste d'une même famille de couleur : la piste est un pas plus clair. */
const looks = {
  blue: { fill: 'bg-blue-500', track: 'bg-sky-100' },
  green: { fill: 'bg-green-700', track: 'bg-green-100' },
  gold: { fill: 'bg-gold-400', track: 'bg-gold-100' },
} as const;

type MeterProps = {
  /** Part entre 0 et 1. `null` : la piste seule, en attendant la donnée. */
  ratio: number | null;
  tone?: keyof typeof looks;
  /** Ce que mesure la jauge, pour les lecteurs d'écran : « Taux de réussite au BEPC ». */
  label: string;
  className?: string;
};

/** Jauge horizontale : une part sur un total. La valeur chiffrée est toujours écrite à côté. */
export function Meter({ ratio, tone = 'blue', label, className }: MeterProps) {
  const look = looks[tone];
  const percent = ratio === null ? null : Math.max(0, Math.min(100, Math.round(ratio * 1000) / 10));

  return (
    <div
      role={percent === null ? undefined : 'meter'}
      aria-hidden={percent === null ? true : undefined}
      aria-label={percent === null ? undefined : label}
      aria-valuemin={percent === null ? undefined : 0}
      aria-valuemax={percent === null ? undefined : 100}
      aria-valuenow={percent ?? undefined}
      className={cn('h-3 w-full overflow-hidden rounded-r-sm', look.track, className)}
    >
      {percent === null ? null : <div className={cn('h-full rounded-r-sm', look.fill)} style={{ width: `${percent}%` }} />}
    </div>
  );
}
