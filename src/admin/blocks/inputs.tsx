'use client';

import { FileText, ImagePlus, Pencil, Trash2, Upload } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { inputClass } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { frenchError } from '../client';
import { fileUrl, uploadImage, uploadPdf } from '../content/api';
import { AdminAlert } from '../ui';
import { formatAmount, parseAmount } from './model';

/** Champs simples des réglages : un libellé, une aide, une erreur, toujours au même endroit. */

export const smallButton =
  'inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-navy-700 transition-colors hover:border-navy-700 disabled:cursor-wait disabled:opacity-60';

type Base = { label: ReactNode; hint?: ReactNode; error?: string; className?: string; disabled?: boolean };

function Frame({ id, label, hint, error, className, children, lang }: Base & { id: string; children: ReactNode; lang?: 'fr' | 'en' }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex flex-wrap items-baseline gap-2 font-semibold">
        <span>{label}</span>
        {lang ? (
          <span className={cn('rounded px-1.5 text-[11px] leading-4 font-bold tracking-wide uppercase', lang === 'fr' ? 'bg-sky-100 text-blue-600' : 'bg-green-100 text-green-800')}>
            {lang === 'fr' ? 'Français' : 'Anglais'}
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-sm leading-5 text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describe = (id: string, hint?: ReactNode, error?: string) => [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;

export function TextField({
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  maxLength,
  multiline,
  lang,
  autoComplete,
  ...base
}: Base & {
  value: string | null;
  onChange: (value: string) => void;
  type?: 'text' | 'tel' | 'email' | 'url' | 'date' | 'time';
  inputMode?: 'text' | 'tel' | 'email' | 'url' | 'numeric';
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  lang?: 'fr' | 'en';
  autoComplete?: string;
}) {
  const id = useId();
  const common = {
    id,
    value: value ?? '',
    placeholder,
    maxLength,
    disabled: base.disabled,
    'aria-invalid': base.error ? true : undefined,
    'aria-describedby': describe(id, base.hint, base.error),
  } as const;
  return (
    <Frame id={id} lang={lang} {...base}>
      {multiline ? (
        <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} className={cn(inputClass(Boolean(base.error)), 'py-3 leading-6 disabled:opacity-60')} />
      ) : (
        <input {...common} type={type} inputMode={inputMode} autoComplete={autoComplete ?? 'off'} onChange={(e) => onChange(e.target.value)} className={cn(inputClass(Boolean(base.error)), 'disabled:opacity-60')} />
      )}
    </Frame>
  );
}

/**
 * Nombre entier saisi librement (« 150 000 », « 150000 ») : le texte tapé reste tel quel pendant la saisie,
 * la valeur lue part dans le formulaire ; mis en forme quand on quitte le champ.
 */
export function NumberField({
  value,
  onChange,
  suffix,
  grouped = true,
  placeholder,
  ...base
}: Base & { value: number | null; onChange: (value: number | null) => void; suffix?: string; grouped?: boolean; placeholder?: string }) {
  const id = useId();
  const show = (v: number | null) => (v === null || Number.isNaN(v) ? '' : grouped ? formatAmount(v) : String(v));
  const [text, setText] = useState(show(value));
  const last = useRef(value);
  // Valeur changée de l'extérieur (tranche ajoutée, réinitialisation) : on suit.
  useEffect(() => {
    if (!Object.is(value, last.current)) {
      last.current = value;
      if (!Number.isNaN(value)) setText(show(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <Frame id={id} {...base}>
      <span className="relative flex items-center">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={text}
          placeholder={placeholder}
          disabled={base.disabled}
          aria-invalid={base.error ? true : undefined}
          aria-describedby={describe(id, base.hint, base.error)}
          onChange={(e) => {
            setText(e.target.value);
            const next = parseAmount(e.target.value);
            last.current = next;
            onChange(next);
          }}
          onBlur={() => {
            if (value !== null && !Number.isNaN(value)) setText(show(value));
          }}
          className={cn(inputClass(Boolean(base.error)), 'tabular-nums disabled:opacity-60', suffix && 'pr-16')}
        />
        {suffix ? <span className="pointer-events-none absolute right-4 text-sm font-semibold text-muted">{suffix}</span> : null}
      </span>
    </Frame>
  );
}

export function CheckField({ label, hint, checked, onChange, disabled }: { label: ReactNode; hint?: ReactNode; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} aria-describedby={hint ? `${id}-hint` : undefined} className="mt-0.5 size-5 shrink-0 accent-navy-700" />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="text-sm leading-5 text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type Upload = { schoolId: string; folder: string };

/** Photo déposée dans le stockage : aperçu, changer, retirer. `shape` : cadrage de l'aperçu. */
export function PhotoField({
  label,
  hint,
  value,
  onChange,
  schoolId,
  folder,
  shape = 'wide',
  disabled,
}: Upload & { label: ReactNode; hint?: ReactNode; value: string | null; onChange: (value: string | null) => void; shape?: 'wide' | 'square' | 'portrait'; disabled?: boolean }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = fileUrl(value);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const image = await uploadImage(file, schoolId, folder, { withThumb: false });
      onChange(image.src);
    } catch (cause) {
      setError(frenchError(cause));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="font-semibold">
        {label}
      </span>
      <div className={cn('flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-control bg-surface-alt', shape === 'wide' ? 'aspect-video w-full' : shape === 'square' ? 'aspect-square w-32' : 'aspect-3/4 w-32')}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="px-3 text-center text-sm text-muted">Pas encore de photo</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={input} id={id} type="file" accept="image/*" className="sr-only" aria-labelledby={`${id}-label`} onChange={(e) => void pick(e.target.files?.[0])} />
        <button type="button" className={smallButton} disabled={busy || disabled} onClick={() => input.current?.click()}>
          {src ? <Pencil aria-hidden="true" className="size-4" /> : <ImagePlus aria-hidden="true" className="size-4" />}
          {busy ? 'Préparation et envoi…' : src ? 'Changer' : 'Choisir une photo'}
        </button>
        {src && !busy && !disabled ? (
          <button type="button" className={smallButton} onClick={() => onChange(null)}>
            <Trash2 aria-hidden="true" className="size-4" />
            Retirer
          </button>
        ) : null}
      </div>
      {hint ? <p className="text-sm leading-5 text-muted">{hint}</p> : null}
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
    </div>
  );
}

export function PdfField({ label, hint, value, onChange, schoolId, folder }: Upload & { label: ReactNode; hint?: ReactNode; value: string | null; onChange: (value: string | null) => void }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = fileUrl(value);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadPdf(file, schoolId, folder));
    } catch (cause) {
      setError(frenchError(cause));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="font-semibold">
        {label}
      </span>
      {url ? (
        <a href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 self-start rounded-lg bg-surface-alt px-3 py-2 text-sm font-semibold text-blue-600 hover:underline">
          <FileText aria-hidden="true" className="size-4.5" />
          {String(value).split('/').pop()}
        </a>
      ) : (
        <p className="text-sm text-muted">Aucun fichier.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <input ref={input} id={id} type="file" accept="application/pdf,.pdf" className="sr-only" aria-labelledby={`${id}-label`} onChange={(e) => void pick(e.target.files?.[0])} />
        <button type="button" className={smallButton} disabled={busy} onClick={() => input.current?.click()}>
          <Upload aria-hidden="true" className="size-4" />
          {busy ? 'Envoi…' : url ? 'Remplacer le PDF' : 'Déposer un PDF'}
        </button>
        {url && !busy ? (
          <button type="button" className={smallButton} onClick={() => onChange(null)}>
            <Trash2 aria-hidden="true" className="size-4" />
            Retirer
          </button>
        ) : null}
      </div>
      {hint ? <p className="text-sm leading-5 text-muted">{hint}</p> : null}
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
    </div>
  );
}

/** Un groupe de champs, avec un titre et une phrase d'explication. */
export function Group({ title, intro, children, action }: { title: string; intro?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl leading-7 font-bold text-navy-700">{title}</h2>
          {intro ? <p className="max-w-2xl text-[15px] leading-6 text-muted">{intro}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
