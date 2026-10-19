import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Apparence commune des champs de saisie et des listes déroulantes. */
export function inputClass(invalid = false): string {
  return cn(
    'min-h-12 w-full rounded-md border-[1.5px] bg-white px-3.5 text-base text-ink transition-colors',
    'placeholder:text-muted focus-visible:border-blue-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-500',
    invalid ? 'border-red-700 bg-red-100/40' : 'border-control hover:border-navy-700',
  );
}

type FieldProps = {
  /** Identifiant du champ : le libellé, l'aide et l'erreur y sont rattachés. */
  id: string;
  label: string;
  required?: boolean;
  /** Mention affichée après le libellé d'un champ facultatif : « (facultatif) ». */
  optional?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Libellé, aide et message d'erreur d'un champ. Le champ lui-même est passé en enfant, avec
 * `id={id}` et `aria-describedby={describedBy(id, hint, error)}`.
 */
export function Field({ id, label, required = false, optional, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-red-700">
            {' '}
            *
          </span>
        ) : null}
        {optional ? <span className="font-normal text-muted"> {optional}</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm leading-5 text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm leading-5 font-semibold text-red-700">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Valeur de `aria-describedby` d'un champ : son erreur si elle existe, sinon son aide. */
export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
