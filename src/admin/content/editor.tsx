'use client';

import { ArchiveRestore, ArrowLeft, Archive, ExternalLink, Save, Send, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { buttonClass } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { frenchError } from '../client';
import { useMe } from '../session';
import { AdminShell } from '../shell';
import { AdminAlert, Spinner } from '../ui';
import { archiveRow, deleteRow, getRow, restoreRow, saveRow, slugify, uniqueSlug } from './api';
import { contentColumns } from './config';
import { FieldControl, validateFields } from './fields';
import { ReviewPanel, StatusBadges } from './review';
import type { ContentConfig, ContentRow } from './types';

type Notice = { tone: 'success' | 'error' | 'info' | 'warning'; text: string };

function slugField(config: ContentConfig) {
  return config.fields.find((f) => f.kind === 'slug');
}

/** Les valeurs à éditer : la proposition en cours si c'est la sienne à poursuivre, sinon la version enregistrée. */
function editableValues(config: ContentConfig, row: ContentRow, canPublish: boolean): Record<string, unknown> {
  const base: Record<string, unknown> = {};
  for (const column of contentColumns(config)) base[column] = row[column] ?? (column.endsWith('_fr') || column.endsWith('_en') ? '' : null);
  if (row.pending && !row.pending._archive && !canPublish) Object.assign(base, Object.fromEntries(Object.entries(row.pending).filter(([k]) => k in base)));
  return base;
}

function Editor({ config }: { config: ContentConfig }) {
  const me = useMe();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const [row, setRow] = useState<ContentRow | null>(null);
  const [values, setValues] = useState<Record<string, unknown> | null>(id ? null : { ...emptyValues(config), ...config.defaults() });
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const slug = slugField(config);
  const slugLocked = Boolean(row && (row.published_at || row.status === 'published'));

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const found = await getRow(config.table, id);
      if (!found) return setLoadError('Ce contenu n’existe plus.');
      setRow(found);
      setValues(editableValues(config, found, me.can_publish));
      setDirty(false);
    } catch (cause) {
      setLoadError(frenchError(cause));
    }
  }, [config, id, me.can_publish]);

  useEffect(() => {
    void load();
  }, [load]);

  // Prévenir avant de quitter une fiche modifiée.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = useCallback(
    (changes: Record<string, unknown>) => {
      setDirty(true);
      setValues((current) => {
        const next = { ...(current ?? {}), ...changes };
        // L'identifiant suit le titre tant qu'il n'a pas été publié ni retouché à la main.
        if (slug?.slugFrom && !slugLocked && `${slug.slugFrom}_fr` in changes && !slugTouched) next[slug.name] = slugify(String(changes[`${slug.slugFrom}_fr`] ?? ''));
        if (slug && slug.name in changes && !(`${slug.slugFrom}_fr` in changes)) setSlugTouched(true);
        return next;
      });
      setErrors((current) => {
        const next = { ...current };
        for (const key of Object.keys(changes)) delete next[key];
        return next;
      });
    },
    [slug, slugLocked, slugTouched],
  );

  const published = row?.status === 'published';
  const archived = Boolean(row?.deleted_at);

  async function save(status: ContentRow['status']) {
    if (!values) return;
    const found = { ...validateFields(config.fields, values), ...(config.validate?.(values) ?? {}) };
    if (Object.keys(found).length) {
      setErrors(found);
      setNotice({ tone: 'error', text: 'Des champs sont à compléter ou à corriger : ils sont signalés en rouge.' });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const next = { ...values };
      if (slug && !slugLocked) {
        const base = slugify(String(next[slug.name] || next[`${slug.slugFrom}_fr`] || ''));
        next[slug.name] = await uniqueSlug(config.table, slug.name, base, row?.id ?? null);
      }
      const saved = await saveRow(config, row?.id ?? null, next, status);
      setRow(saved);
      setValues(editableValues(config, saved, me.can_publish));
      setDirty(false);
      setNotice({ tone: 'success', text: afterSave(saved, status, me.can_publish, published) });
      if (!row) router.replace(`${config.path}modifier/?id=${saved.id}`);
    } catch (cause) {
      const message = frenchError(cause);
      setNotice({ tone: 'error', text: /duplicate key|23505/.test(message) ? 'Cet identifiant est déjà utilisé par un autre contenu : modifiez-le.' : message });
    } finally {
      setBusy(false);
    }
  }

  async function act(action: () => Promise<ContentRow | void>, text: string) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await action();
      if (result) {
        setRow(result);
        setValues(editableValues(config, result, me.can_publish));
        setDirty(false);
      }
      setNotice({ tone: 'success', text });
    } catch (cause) {
      setNotice({ tone: 'error', text: frenchError(cause) });
    } finally {
      setBusy(false);
    }
  }

  const sitePath = useMemo(() => (row && published && !archived && config.sitePath ? config.sitePath(row) : null), [row, published, archived, config]);

  if (loadError) return <AdminAlert tone="error" title="Impossible d’ouvrir ce contenu">{loadError}</AdminAlert>;
  if (!values) return <Spinner label="Chargement" />;

  const title = row ? config.titleOf(row) || 'Sans titre' : config.newLabel;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-28">
      <Link href={config.path} className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-blue-600">
        <ArrowLeft aria-hidden="true" className="size-4.5" />
        {config.title}
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl leading-tight font-bold text-balance text-navy-700">{title}</h1>
        {row ? (
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadges row={row} />
            {sitePath ? (
              <a href={sitePath} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
                <ExternalLink aria-hidden="true" className="size-4" />
                Voir sur le site
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      {row ? <ReviewPanel config={config} row={row} me={me} onChange={(next) => { setRow(next); setValues(editableValues(config, next, me.can_publish)); setDirty(false); }} /> : null}

      {published && !me.can_publish && !archived ? (
        <AdminAlert tone="info" title="Ce contenu est en ligne">
          Vos modifications seront envoyées au Principal sous forme de proposition. La version actuelle reste sur le site jusqu’à sa validation.
        </AdminAlert>
      ) : null}
      {archived ? <AdminAlert tone="warning" title="Contenu archivé">Il n’apparaît plus sur le site. Vous pouvez le restaurer.</AdminAlert> : null}

      <form
        className="grid gap-6 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save(me.can_publish ? 'published' : published ? 'published' : 'submitted');
        }}
        noValidate
      >
        {config.fields.map((field) => (
          <div key={field.name} className={cn(field.half ? 'sm:col-span-1' : 'sm:col-span-2')}>
            <FieldControl field={field} values={values} set={set} errors={errors} schoolId={me.school.id} folder={config.folder} slugLocked={slugLocked} />
          </div>
        ))}
        {values.uses_fee_grid ? (
          <div className="sm:col-span-2">
            <AdminAlert tone="info">Le fichier de ce document est celui de la grille des frais : il se dépose avec les frais (lot B4).</AdminAlert>
          </div>
        ) : null}

        {/* Barre d'actions, toujours visible en bas de l'écran */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 shadow-float backdrop-blur-sm sm:col-span-2 lg:left-[17rem]">
          <div className="mx-auto flex max-w-4xl flex-col gap-2">
            {notice ? <AdminAlert tone={notice.tone}>{notice.text}</AdminAlert> : null}
            <div className="flex flex-wrap items-center gap-2">
              {archived ? (
                <button type="button" disabled={busy} className={buttonClass('primary', 'disabled:opacity-60')} onClick={() => row && void act(() => restoreRow(config, row), 'Contenu restauré.')}>
                  <ArchiveRestore aria-hidden="true" className="size-5" />
                  Restaurer
                </button>
              ) : (
                <>
                  {!published ? (
                    <button type="button" disabled={busy} className={buttonClass('secondary', 'disabled:opacity-60')} onClick={() => void save('draft')}>
                      <Save aria-hidden="true" className="size-5" />
                      Enregistrer le brouillon
                    </button>
                  ) : null}
                  <button type="submit" disabled={busy} className={buttonClass('primary', 'disabled:opacity-60')}>
                    {me.can_publish ? <Upload aria-hidden="true" className="size-5" /> : <Send aria-hidden="true" className="size-5" />}
                    {busy ? 'Enregistrement…' : me.can_publish ? (published ? 'Enregistrer' : 'Valider et publier') : published ? 'Proposer la modification' : 'Envoyer au Principal'}
                  </button>
                  {dirty ? <span className="text-sm text-muted">Modifications non enregistrées</span> : null}
                </>
              )}
              <span className="flex-1" />
              {row && !archived ? (
                <button type="button" disabled={busy} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-muted hover:text-red-700" onClick={() => void act(() => archiveRow(config, row), published && !me.can_publish ? 'Demande d’archivage envoyée au Principal.' : 'Contenu archivé : il n’apparaîtra plus sur le site après la prochaine mise à jour.')}>
                  <Archive aria-hidden="true" className="size-4.5" />
                  Archiver
                </button>
              ) : null}
              {row && archived && me.role === 'super_admin' ? (
                confirmDelete ? (
                  <button type="button" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-700 px-3 text-sm font-semibold text-white" onClick={() => void act(async () => { await deleteRow(config, row); router.replace(config.path); }, 'Supprimé définitivement.')}>
                    <Trash2 aria-hidden="true" className="size-4.5" />
                    Confirmer la suppression définitive
                  </button>
                ) : (
                  <button type="button" className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-red-700" onClick={() => setConfirmDelete(true)}>
                    <Trash2 aria-hidden="true" className="size-4.5" />
                    Supprimer définitivement
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function emptyValues(config: ContentConfig): Record<string, unknown> {
  return Object.fromEntries(contentColumns(config).map((c) => [c, c.endsWith('_fr') || c.endsWith('_en') ? '' : null]));
}

function afterSave(saved: ContentRow, status: ContentRow['status'], canPublish: boolean, wasPublished: boolean): string {
  if (saved.pending && !canPublish) return 'Proposition envoyée au Principal. La version en ligne reste en place jusqu’à sa validation.';
  if (saved.status === 'published') return 'Enregistré et validé. Le changement apparaîtra sur le site à la prochaine mise à jour (bouton du tableau de bord).';
  if (saved.status === 'submitted') return 'Envoyé au Principal pour validation.';
  if (status === 'draft' && wasPublished) return 'Retiré du site à la prochaine mise à jour : le contenu redevient un brouillon.';
  return 'Brouillon enregistré. Il n’est pas visible sur le site.';
}

/** Page de modification d'un contenu : /admin/<contenu>/modifier/?id=… (sans id : nouveau contenu). */
export function ContentEditorPage({ config }: { config: ContentConfig }) {
  return (
    <AdminShell>
      <Suspense fallback={<Spinner label="Chargement" />}>
        <Editor config={config} />
      </Suspense>
    </AdminShell>
  );
}
