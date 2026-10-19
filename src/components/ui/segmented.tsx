import { cn } from '@/lib/utils';

type SegmentedProps<T extends string> = {
  legend: string;
  /** Nom du groupe de boutons radio : unique dans la page. */
  name: string;
  value: T;
  options: { value: T; label: string; lang?: string }[];
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Choix unique parmi deux ou trois options, présenté en boutons côte à côte.
 * Ce sont de vrais boutons radio : clavier et lecteurs d'écran fonctionnent sans code supplémentaire.
 */
export function Segmented<T extends string>({ legend, name, value, options, onChange, className }: SegmentedProps<T>) {
  return (
    <fieldset className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <legend className="mb-1.5 font-semibold">{legend}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-[10px] border-[1.5px] border-control bg-surface-alt p-1">
        {options.map((option) => (
          <label
            key={option.value}
            lang={option.lang}
            className={cn(
              'flex min-h-11 cursor-pointer items-center justify-center rounded-md px-2 text-center text-[15px] leading-5 font-semibold transition-colors',
              'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-500',
              option.value === value ? 'bg-navy-700 text-white shadow-card' : 'text-navy-700 hover:bg-white',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
