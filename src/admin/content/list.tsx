'use client';

import { ArrowDown, ArrowUp, ImagePlus, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { frenchError } from '../client';
import { useMe } from '../session';
import { AdminShell } from '../shell';
import { AdminAlert, PageTitle, Spinner } from '../ui';
import { fileUrl, listRows, saveRow, swapPositions, uploadImage } from './api';
import { StatusBadges } from './review';
import type { ContentConfig, ContentRow } from './types';

type Filter = 'all' | 'review' | 'published' | 'draft' | 'archived';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'review', label: 'À valider' },
  { id: 'published', label: 'En ligne' },
  { id: 'draft', label: 'Brouillons' },
  { id: 'archived', label: 'Archivés' },
];

function matches(row: ContentRow, filter: Filter): boolean {
  if (filter === 'archived') return Boolean(row.deleted_at);
  if (row.deleted_at) return Boolean(row.pending); // un archivage demandé reste visible
  if (filter === 'review') return row.status === 'submitted' || Boolean(row.pending);
  if (filter === 'published') return row.status === 'published';
  if (filter === 'draft') return row.status === 'draft';
  return true;
}

const plain = (text: unknown) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Envoi de plusieurs photos d'un coup : chacune devient un brouillon à légender. */
function GalleryUploader({ config, onDone }: { config: ContentConfig; onDone: () => void }) {
  const me = useMe();
  const input = useRef<HTMLInputElement>(null);
  const category = config.fields.find((f) => f.name === 'category');
  const [chosen, setChosen] = useState(category?.options?.[0]?.value ?? '');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = [...files];
    setProgress({ done: 0, total: list.length });
    try {
      for (const [index, file] of list.entries()) {
        const image = await uploadImage(file, me.school.id, config.folder);
        const caption = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim();
        await saveRow(
          config,
          null,
          { category: chosen, src: image.src, thumb: image.thumb, width: image.width, height: image.height, caption_fr: caption || 'Photo à légender', caption_en: '', position: Date.now() % 1_000_000_000 + index },
          'draft',
        );
        setProgress({ done: index + 1, total: list.length });
      }
      onDone();
    } catch (cause) {
      setError(frenchError(cause));
    } finally {
      setProgress(null);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-control bg-white p-5">
      <p className="font-semibold">Ajouter des photos</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-48 flex-col gap-1.5">
          <span className="text-sm font-semibold">Thème</span>
          <select value={chosen} onChange={(e) => setChosen(e.target.value)} className={inputClass()}>
            {category?.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <input ref={input} type="file" accept="image/*" multiple className="sr-only" aria-label="Photos à ajouter" onChange={(e) => void send(e.target.files)} />
        <button type="button" className={buttonClass('primary')} disabled={Boolean(progress)} onClick={() => input.current?.click()}>
          <ImagePlus aria-hidden="true" className="size-5" />
          {progress ? `Envoi ${progress.done + 1} sur ${progress.total}…` : 'Choisir les photos'}
        </button>
      </div>
      <p className="text-sm text-muted">Plusieurs photos à la fois. Chacune est réduite avant l’envoi, puis enregistrée en brouillon : ajoutez la légende, puis envoyez-la pour validation.</p>
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
    </div>
  );
}

function List({ config }: { config: ContentConfig }) {
  const me = useMe();
  const [rows, setRows] = useState<ContentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [moving, setMoving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await listRows(config));
      setError(null);
    } catch (cause) {
      setError(frenchError(cause));
    }
  }, [config]);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryField = config.fields.find((f) => f.name === config.categoryField);
  const counts = useMemo(() => Object.fromEntries(filters.map((f) => [f.id, (rows ?? []).filter((r) => matches(r, f.id)).length])), [rows]);
  const shown = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          matches(r, filter) &&
          (!category || r[config.categoryField ?? ''] === category) &&
          (!query || plain(`${config.titleOf(r)} ${config.subtitleOf(r)}`).includes(plain(query))),
      ),
    [rows, filter, category, query, config],
  );
  const canReorder = Boolean(config.positionColumn) && filter === 'all' && !category && !query;

  async function move(index: number, direction: -1 | 1) {
    const other = shown[index + direction];
    if (!other) return;
    setMoving(true);
    try {
      await swapPositions(config, shown[index], other);
      await load();
    } catch (cause) {
      setError(frenchError(cause));
    } finally {
      setMoving(false);
    }
  }

  const gallery = config.table === 'gallery_photos';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle title={config.title} />
        {!gallery ? (
          <Link href={`${config.path}modifier/`} className={buttonClass('primary')}>
            <Plus aria-hidden="true" className="size-5" />
            {config.newLabel}
          </Link>
        ) : null}
      </div>

      {gallery ? <GalleryUploader config={config} onDone={() => void load()} /> : null}

      <div className="flex flex-col gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrer par état">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors',
                filter === f.id ? 'border-navy-700 bg-navy-700 text-white' : 'border-line bg-white text-navy-700 hover:border-navy-700',
              )}
            >
              {f.label}
              {rows ? <span className={cn('rounded-full px-2 text-xs leading-5', filter === f.id ? 'bg-indigo-900 text-white' : 'bg-surface-alt')}>{counts[f.id]}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="relative min-w-60 flex-1">
            <span className="sr-only">Rechercher</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…" className={cn(inputClass(), 'pl-10')} />
          </label>
          {categoryField ? (
            <label className="min-w-52">
              <span className="sr-only">{categoryField.label}</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass()}>
                <option value="">{`${categoryField.label} : toutes`}</option>
                {categoryField.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
      {!rows ? (
        <Spinner label="Chargement" />
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-muted">{config.emptyText}</p>
      ) : (
        <ul className={cn(gallery ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col gap-3')}>
          {shown.map((row, index) => {
            const thumb = fileUrl(config.thumbOf?.(row));
            return (
              <li key={row.id} className={cn('flex rounded-2xl border border-line bg-white transition-colors hover:border-navy-700', gallery ? 'flex-col overflow-hidden' : 'items-center gap-4 p-3 sm:p-4')}>
                <Link href={`${config.path}modifier/?id=${row.id}`} className={cn('flex min-w-0 flex-1', gallery ? 'flex-col' : 'items-center gap-4')}>
                  {config.thumbOf ? (
                    <span className={cn('flex shrink-0 items-center justify-center overflow-hidden bg-surface-alt', gallery ? 'aspect-4/3 w-full' : 'size-16 rounded-xl sm:h-16 sm:w-24')}>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" loading="lazy" className="size-full object-cover" />
                      ) : (
                        <span className="px-2 text-center text-xs text-muted">Sans photo</span>
                      )}
                    </span>
                  ) : null}
                  <span className={cn('flex min-w-0 flex-1 flex-col gap-1.5', gallery && 'p-4')}>
                    <span className="font-semibold text-pretty text-navy-700">{config.titleOf(row) || 'Sans titre'}</span>
                    <span className="text-sm text-muted">{config.subtitleOf(row)}</span>
                    <span className="flex flex-wrap gap-1.5">
                      <StatusBadges row={row} />
                      {Object.keys(row).some((k) => k.endsWith('_en') && row[k.replace(/_en$/, '_fr')] && !row[k]) && !row.deleted_at ? (
                        <span className="inline-flex items-center rounded-full bg-surface-alt px-2.5 py-0.5 text-[13px] leading-5 font-semibold text-muted">Anglais à compléter</span>
                      ) : null}
                    </span>
                  </span>
                </Link>
                {canReorder ? (
                  <span className={cn('flex shrink-0 gap-1', gallery ? 'border-t border-line p-2' : 'flex-col')}>
                    <button type="button" disabled={moving || index === 0} onClick={() => void move(index, -1)} className="flex size-10 items-center justify-center rounded-lg text-navy-700 hover:bg-surface-alt disabled:opacity-30" aria-label={`Monter : ${config.titleOf(row)}`}>
                      <ArrowUp aria-hidden="true" className="size-4.5" />
                    </button>
                    <button type="button" disabled={moving || index === shown.length - 1} onClick={() => void move(index, 1)} className="flex size-10 items-center justify-center rounded-lg text-navy-700 hover:bg-surface-alt disabled:opacity-30" aria-label={`Descendre : ${config.titleOf(row)}`}>
                      <ArrowDown aria-hidden="true" className="size-4.5" />
                    </button>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {me.can_publish ? null : (
        <p className="text-sm text-muted">Vos ajouts et modifications sont validés par le Principal avant d’apparaître sur le site.</p>
      )}
    </div>
  );
}

export function ContentListPage({ config }: { config: ContentConfig }) {
  return (
    <AdminShell>
      <List config={config} />
    </AdminShell>
  );
}
