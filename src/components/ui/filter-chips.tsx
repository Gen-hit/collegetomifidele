'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterOption<T extends string> = { value: T; label: string; count?: number; Icon?: LucideIcon };

type FilterChipsProps<T extends string> = {
  /** Nom accessible du groupe : « Filtrer par catégorie ». */
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Rangée de filtres : un seul choix actif à la fois. Sur téléphone, la rangée défile horizontalement
 * au lieu d'occuper plusieurs lignes.
 */
export function FilterChips<T extends string>({ label, options, value, onChange, className }: FilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden', className)}
    >
      {options.map(({ value: option, label: text, count, Icon }) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] leading-5 font-semibold transition-colors',
              active ? 'border-navy-700 bg-navy-700 text-white' : 'border-line bg-white text-navy-700 hover:border-navy-700 hover:bg-surface-alt',
            )}
          >
            {Icon ? <Icon aria-hidden="true" className="size-4.5 shrink-0" strokeWidth={1.75} /> : null}
            {text}
            {count === undefined ? null : (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[13px] leading-5 font-semibold tabular-nums',
                  active ? 'bg-white/20 text-white' : 'bg-surface-alt text-muted',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
