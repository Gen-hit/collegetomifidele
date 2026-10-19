'use client';

import { Bold, Eye, FileText, Heading2, ImagePlus, Link2, List, Pencil, Quote, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { ArticleBody } from '@/components/sections/article-body';
import { inputClass } from '@/components/ui/field';
import { parseArticle } from '@/lib/article';
import { cn } from '@/lib/utils';
import { frenchError } from '../client';
import { AdminAlert } from '../ui';
import { fileUrl, slugify, uploadImage, uploadPdf } from './api';
import { today } from './config';
import type { FieldConfig } from './types';

export type FieldProps = {
  field: FieldConfig;
  values: Record<string, unknown>;
  set: (changes: Record<string, unknown>) => void;
  errors: Record<string, string>;
  schoolId: string;
  folder: string;
  /** L'identifiant (adresse, lien de partage) est figé : le contenu a déjà été publié. */
  slugLocked: boolean;
};

const smallButton =
  'inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-navy-700 transition-colors hover:border-navy-700 disabled:cursor-wait disabled:opacity-60';

function Label({ htmlFor, children, required, lang }: { htmlFor: string; children: ReactNode; required?: boolean; lang?: 'fr' | 'en' }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-wrap items-baseline gap-2 font-semibold">
      <span>
        {children}
        {required ? (
          <span aria-hidden="true" className="text-red-700">
            {' '}
            *
          </span>
        ) : null}
      </span>
      {lang ? (
        <span className={cn('rounded px-1.5 text-[11px] leading-5 font-bold tracking-wide uppercase', lang === 'fr' ? 'bg-sky-100 text-blue-600' : 'bg-green-100 text-green-800')}>
          {lang === 'fr' ? 'Français' : 'English'}
        </span>
      ) : null}
    </label>
  );
}

function Hint({ id, children }: { id: string; children?: ReactNode }) {
  return children ? (
    <p id={id} className="text-sm leading-5 text-muted">
      {children}
    </p>
  ) : null;
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-semibold text-red-700">
      {message}
    </p>
  ) : null;
}

/** Un champ texte, une zone de texte ou une liste, dans une langue donnée. */
function TextControl({ field, column, lang, value, set, error }: { field: FieldConfig; column: string; lang?: 'fr' | 'en'; value: unknown; set: FieldProps['set']; error?: string }) {
  const id = useId();
  const required = Boolean(field.required && lang !== 'en');
  const describedBy = [error ? `${id}-error` : '', field.hint && lang !== 'en' ? `${id}-hint` : '', lang === 'en' ? `${id}-en` : ''].filter(Boolean).join(' ') || undefined;
  const text = typeof value === 'string' ? value : '';
  const common = {
    id,
    value: text,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    maxLength: field.maxLength,
  } as const;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={required} lang={lang}>
        {field.label}
      </Label>
      {field.kind === 'textarea' ? (
        <textarea {...common} rows={field.rows ?? 3} onChange={(e) => set({ [column]: e.target.value })} className={cn(inputClass(Boolean(error)), 'py-3 leading-6')} />
      ) : (
        <input {...common} type="text" onChange={(e) => set({ [column]: e.target.value })} className={inputClass(Boolean(error))} />
      )}
      {lang !== 'en' ? <Hint id={`${id}-hint`}>{field.hint}</Hint> : <Hint id={`${id}-en`}>Facultatif : laissé vide, le site anglais reprend le texte français.</Hint>}
      {field.maxLength && text.length > field.maxLength * 0.85 ? (
        <p className="text-sm text-muted">{`${text.length} / ${field.maxLength} caractères`}</p>
      ) : null}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

function SelectControl({ field, values, set, errors }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={field.required}>
        {field.label}
      </Label>
      <select id={id} value={String(values[field.name] ?? '')} onChange={(e) => set({ [field.name]: e.target.value })} className={inputClass(Boolean(errors[field.name]))}>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Hint id={`${id}-hint`}>{field.hint}</Hint>
      <ErrorText id={`${id}-error`} message={errors[field.name]} />
    </div>
  );
}

function DateControl({ field, values, set, errors }: FieldProps) {
  const id = useId();
  const value = typeof values[field.name] === 'string' ? String(values[field.name]).slice(0, 10) : '';
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={field.required}>
        {field.label}
      </Label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => set({ [field.name]: e.target.value || null })}
        aria-invalid={errors[field.name] ? true : undefined}
        aria-describedby={`${id}-hint ${id}-error`}
        className={inputClass(Boolean(errors[field.name]))}
      />
      <Hint id={`${id}-hint`}>{field.hint}</Hint>
      <ErrorText id={`${id}-error`} message={errors[field.name]} />
    </div>
  );
}

function CheckboxControl({ field, values, set }: FieldProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-alt p-4">
      <input id={id} type="checkbox" checked={Boolean(values[field.name])} onChange={(e) => set({ [field.name]: e.target.checked })} className="mt-1 size-5 accent-navy-700" aria-describedby={`${id}-hint`} />
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="font-semibold">
          {field.label}
        </label>
        <Hint id={`${id}-hint`}>{field.hint}</Hint>
      </div>
    </div>
  );
}

function SlugControl({ field, values, set, slugLocked, errors }: FieldProps) {
  const id = useId();
  const value = String(values[field.name] ?? '');
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{field.label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id={id}
          type="text"
          value={value}
          readOnly={slugLocked}
          onChange={(e) => set({ [field.name]: slugify(e.target.value) })}
          className={cn(inputClass(Boolean(errors[field.name])), 'flex-1 font-mono text-sm', slugLocked && 'bg-surface-alt text-muted')}
          aria-describedby={`${id}-hint`}
        />
        {!slugLocked && field.slugFrom ? (
          <button type="button" className={cn(smallButton, 'self-start sm:self-auto')} onClick={() => set({ [field.name]: slugify(String(values[`${field.slugFrom}_fr`] ?? '')) })}>
            Refaire à partir du titre
          </button>
        ) : null}
      </div>
      <Hint id={`${id}-hint`}>{slugLocked ? 'Publié : l’identifiant ne change plus, pour ne pas casser les liens partagés.' : field.hint}</Hint>
      <ErrorText id={`${id}-error`} message={errors[field.name]} />
    </div>
  );
}

function ImageControl({ field, values, set, schoolId, folder }: FieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = fileUrl(values[field.thumbColumn ?? ''] ?? values[field.name]);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const image = await uploadImage(file, schoolId, folder);
      const changes: Record<string, unknown> = { [field.name]: image.src };
      if (field.thumbColumn) changes[field.thumbColumn] = image.thumb;
      if (field.sizeColumns) Object.assign(changes, { width: image.width, height: image.height });
      set(changes);
    } catch (cause) {
      setError(frenchError(cause));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  function remove() {
    const changes: Record<string, unknown> = { [field.name]: null };
    if (field.thumbColumn) changes[field.thumbColumn] = null;
    if (field.sizeColumns) Object.assign(changes, { width: null, height: null });
    set(changes);
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="font-semibold">
        {field.label}
      </span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex aspect-video w-full max-w-60 items-center justify-center overflow-hidden rounded-xl border border-dashed border-control bg-surface-alt">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <span className="px-3 text-center text-sm text-muted">Pas encore de photo</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={input} id={id} type="file" accept="image/*" className="sr-only" aria-labelledby={`${id}-label`} onChange={(e) => void pick(e.target.files?.[0])} />
          <button type="button" className={smallButton} disabled={busy} onClick={() => input.current?.click()}>
            {src ? <Pencil aria-hidden="true" className="size-4" /> : <ImagePlus aria-hidden="true" className="size-4" />}
            {busy ? 'Préparation et envoi…' : src ? 'Changer de photo' : 'Choisir une photo'}
          </button>
          {src && !busy ? (
            <button type="button" className={smallButton} onClick={remove}>
              <Trash2 aria-hidden="true" className="size-4" />
              Retirer
            </button>
          ) : null}
        </div>
      </div>
      <Hint id={`${id}-hint`}>{field.hint}</Hint>
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
    </div>
  );
}

function PdfControl({ field, values, set, schoolId, folder }: FieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = values[field.name];
  const url = fileUrl(value);
  const name = typeof value === 'string' ? value.split('/').pop() : '';

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const stored = await uploadPdf(file, schoolId, folder);
      set({ [field.name]: stored, updated_on: today() });
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
        {field.label}
      </span>
      {url ? (
        <a href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 self-start rounded-lg bg-surface-alt px-3 py-2 text-sm font-semibold text-blue-600 underline-offset-4 hover:underline">
          <FileText aria-hidden="true" className="size-4.5" />
          {name}
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
          <button type="button" className={smallButton} onClick={() => set({ [field.name]: null })}>
            <Trash2 aria-hidden="true" className="size-4" />
            Retirer
          </button>
        ) : null}
      </div>
      <Hint id={`${id}-hint`}>{field.hint}</Hint>
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
    </div>
  );
}

/** Texte d'article : barre de mise en forme, photos dans le texte et aperçu identique au site. */
function MarkdownControl({ field, column, lang, value, set, error, schoolId, folder }: { field: FieldConfig; column: string; lang: 'fr' | 'en'; value: unknown; set: FieldProps['set']; error?: string; schoolId: string; folder: string }) {
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const photo = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const text = typeof value === 'string' ? value : '';

  /** Insère du texte autour de la sélection, en début de ligne pour les blocs. */
  function wrap(before: string, after = '', block = false) {
    const el = area.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = text.slice(start, end);
    let insert = `${before}${selected || ''}${after}`;
    let prefix = text.slice(0, start);
    if (block) {
      if (prefix && !prefix.endsWith('\n\n')) prefix += prefix.endsWith('\n') ? '\n' : '\n\n';
      insert += '\n\n';
    }
    const next = prefix + insert + text.slice(end);
    set({ [column]: next });
    requestAnimationFrame(() => {
      el.focus();
      const caret = prefix.length + before.length + selected.length;
      el.setSelectionRange(caret, caret);
    });
  }

  async function addPhoto(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    try {
      const image = await uploadImage(file, schoolId, folder);
      wrap(`![Légende de la photo](${image.src})`, '', true);
    } catch (cause) {
      setUploadError(frenchError(cause));
    } finally {
      setBusy(false);
      if (photo.current) photo.current.value = '';
    }
  }

  // Aperçu : les photos déposées s'affichent depuis le stockage.
  const previewText = text.replace(/\((storage:[^)\s]+)\)/g, (_, src: string) => `(${fileUrl(src)})`);
  const tools: { label: string; Icon: typeof Bold; run: () => void }[] = [
    { label: 'Intertitre', Icon: Heading2, run: () => wrap('## ', '', true) },
    { label: 'Gras', Icon: Bold, run: () => wrap('**', '**') },
    { label: 'Liste', Icon: List, run: () => wrap('- ', '', true) },
    { label: 'Citation', Icon: Quote, run: () => wrap('> ', '\n> — Auteur', true) },
    { label: 'Lien', Icon: Link2, run: () => wrap('[', '](https://)') },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={Boolean(field.required && lang === 'fr')} lang={lang}>
        {field.label}
      </Label>
      <div className={cn('overflow-hidden rounded-md border-[1.5px] bg-white', error ? 'border-red-700' : 'border-control')}>
        <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-alt p-1.5" role="toolbar" aria-label="Mise en forme">
          {tools.map(({ label, Icon, run }) => (
            <button key={label} type="button" onClick={run} disabled={preview} title={label} className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-navy-700 hover:bg-white disabled:opacity-40">
              <Icon aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sr-only sm:hidden">{label}</span>
            </button>
          ))}
          <input ref={photo} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void addPhoto(e.target.files?.[0])} />
          <button type="button" onClick={() => photo.current?.click()} disabled={preview || busy} className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-navy-700 hover:bg-white disabled:opacity-40">
            <ImagePlus aria-hidden="true" className="size-4" />
            {busy ? 'Envoi…' : 'Photo'}
          </button>
          <button type="button" onClick={() => setPreview((p) => !p)} aria-pressed={preview} className={cn('ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold', preview ? 'bg-navy-700 text-white' : 'text-navy-700 hover:bg-white')}>
            <Eye aria-hidden="true" className="size-4" />
            Aperçu
          </button>
        </div>
        {preview ? (
          <div className="max-h-[32rem] overflow-y-auto p-4 sm:p-6">
            {text.trim() ? <ArticleBody blocks={parseArticle(previewText)} photoWord="Photo" photoRatio="4:3" /> : <p className="text-muted">Rien à afficher pour l’instant.</p>}
          </div>
        ) : (
          <textarea
            ref={area}
            id={id}
            value={text}
            rows={field.rows ?? 12}
            onChange={(e) => set({ [column]: e.target.value })}
            aria-invalid={error ? true : undefined}
            aria-describedby={`${id}-hint`}
            className="block w-full resize-y px-3.5 py-3 text-base leading-7 text-ink outline-none"
          />
        )}
      </div>
      <p id={`${id}-hint`} className="text-sm leading-5 text-muted">
        {lang === 'en'
          ? 'Facultatif : laissé vide, le site anglais reprend le texte français.'
          : 'Un paragraphe par bloc, une ligne vide entre deux blocs. Les boutons ajoutent la mise en forme ; « Aperçu » montre le résultat.'}
      </p>
      {uploadError ? <AdminAlert tone="error">{uploadError}</AdminAlert> : null}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

/** Le champ, dans les deux langues s'il est bilingue. */
export function FieldControl(props: FieldProps) {
  const { field, values, set, errors } = props;
  if (field.showIf && !field.showIf(values)) return null;
  if (field.bilingual) {
    return (
      <fieldset className="flex flex-col gap-4">
        <legend className="sr-only">{field.label}</legend>
        {(['fr', 'en'] as const).map((lang) => {
          const column = `${field.name}_${lang}`;
          return field.kind === 'markdown' ? (
            <MarkdownControl key={lang} field={field} column={column} lang={lang} value={values[column]} set={set} error={errors[column]} schoolId={props.schoolId} folder={props.folder} />
          ) : (
            <div key={lang} className={cn(lang === 'en' && 'border-l-2 border-green-300 pl-4')}>
              <TextControl field={field} column={column} lang={lang} value={values[column]} set={set} error={errors[column]} />
            </div>
          );
        })}
      </fieldset>
    );
  }
  switch (field.kind) {
    case 'select':
      return <SelectControl {...props} />;
    case 'date':
      return <DateControl {...props} />;
    case 'checkbox':
      return <CheckboxControl {...props} />;
    case 'slug':
      return <SlugControl {...props} />;
    case 'image':
      return <ImageControl {...props} />;
    case 'pdf':
      return <PdfControl {...props} />;
    default:
      return <TextControl field={field} column={field.name} value={values[field.name]} set={set} error={errors[field.name]} />;
  }
}

/** Champs obligatoires et contrôles propres au contenu : { colonne: message }. */
export function validateFields(fields: FieldConfig[], values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.required || (field.showIf && !field.showIf(values))) continue;
    const column = field.bilingual ? `${field.name}_fr` : field.name;
    const value = values[column];
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) errors[column] = 'À remplir.';
  }
  return errors;
}
