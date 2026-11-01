'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buttonClass } from '@/components/ui/button';
import { frenchError, supabase } from '../client';
import { relativeTime } from '../labels';
import { useMe, type Me } from '../session';
import { AdminShell } from '../shell';
import { useStaffNames } from '../content/review';
import { AdminAlert, PageTitle, Spinner } from '../ui';
import { blockRules, type BlockData, type BlockKey, type Errors } from './model';

type BlockRow<K extends BlockKey> = { id: string; key: K; data: BlockData[K]; updated_at: string; updated_by: string | null; pending: unknown; pending_by?: string | null };

export type BlockFormProps<K extends BlockKey> = {
  data: BlockData[K];
  /** Modifie une partie des réglages : `set((d) => ({ ...d, city: 'Douala' }))`. */
  set: (update: (data: BlockData[K]) => BlockData[K]) => void;
  errors: Errors;
  schoolId: string;
  readOnly: boolean;
  me: Me;
};

type EditorProps<K extends BlockKey> = {
  blockKey: K;
  title: string;
  intro: ReactNode;
  /** Valeurs de départ si le bloc n'existe pas encore dans la base (fichier content/data/<bloc>.json). */
  initial: BlockData[K];
  /** Seul l'administrateur du site peut enregistrer (numéros de paiement). */
  superAdminOnly?: boolean;
  form: (props: BlockFormProps<K>) => ReactNode;
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Proposition en attente sur un réglage (envoyée par EduFlow) : { key, data }. */
function proposedData<K extends BlockKey>(pending: unknown): Partial<BlockData[K]> | null {
  if (!pending || typeof pending !== 'object' || '_archive' in pending) return null;
  const data = (pending as { data?: unknown }).data;
  return data && typeof data === 'object' ? (data as Partial<BlockData[K]>) : null;
}

function Editor<K extends BlockKey>({ blockKey, title, intro, initial, superAdminOnly, form }: EditorProps<K>) {
  const me = useMe();
  const names = useStaffNames();
  const [row, setRow] = useState<BlockRow<K> | null>(null);
  const [data, setData] = useState<BlockData[K] | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const readOnly = (superAdminOnly && me.role !== 'super_admin') || me.role === 'secretariat';

  const load = useCallback(async () => {
    const { data: found, error } = await supabase().from('content_blocks').select('id, key, data, updated_at, updated_by, pending, pending_by').eq('key', blockKey).maybeSingle();
    if (error) {
      setLoadError(frenchError(error));
      return;
    }
    const next = found as BlockRow<K> | null;
    setRow(next);
    // Les clés ajoutées depuis l'enregistrement du bloc prennent leur valeur de départ.
    setData({ ...initial, ...(next?.data ?? {}) } as BlockData[K]);
  }, [blockKey, initial]);

  useEffect(() => {
    void load();
  }, [load]);

  const saved = useMemo(() => (row ? ({ ...initial, ...row.data } as BlockData[K]) : initial), [row, initial]);
  const dirty = data !== null && !same(data, saved);

  // Quitter la page avec des changements non enregistrés : le navigateur demande confirmation.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = useCallback((update: (current: BlockData[K]) => BlockData[K]) => {
    setData((current) => (current ? update(current) : current));
    setResult(null);
  }, []);

  const proposal = row ? proposedData<K>(row.pending) : null;
  const [reviewing, setReviewing] = useState(false);

  /** Charge la proposition dans le formulaire pour la relire avant de la valider. */
  function review() {
    if (!proposal) return;
    setData({ ...initial, ...(row?.data ?? {}), ...proposal } as BlockData[K]);
    setReviewing(true);
    setResult({ tone: 'warning', text: 'La proposition est affichée dans le formulaire. Relisez-la, puis validez-la ou refusez-la.' });
  }

  async function decide(accept: boolean) {
    if (!row || !proposal) return;
    const next = { ...initial, ...row.data, ...proposal } as BlockData[K];
    const rules = blockRules[blockKey];
    if (accept) {
      const found = rules.check(next as never);
      if (Object.keys(found).length > 0) {
        setData(next);
        setErrors(found);
        setReviewing(true);
        setResult({ tone: 'error', text: 'La proposition contient des champs à corriger (en rouge). Corrigez-les puis enregistrez, ou refusez la proposition.' });
        return;
      }
    }
    setSaving(true);
    const changes = accept ? { data: rules.normalize(next as never), pending: null } : { pending: null };
    const response = await supabase().from('content_blocks').update(changes).eq('id', row.id).select('id, key, data, updated_at, updated_by, pending, pending_by').single();
    setSaving(false);
    if (response.error) return setResult({ tone: 'error', text: frenchError(response.error) });
    const saved = response.data as BlockRow<K>;
    setRow(saved);
    setData({ ...initial, ...saved.data } as BlockData[K]);
    setReviewing(false);
    setErrors({});
    setResult(
      accept
        ? { tone: 'success', text: 'Proposition validée. Elle apparaîtra sur le site à la prochaine mise à jour.' }
        : { tone: 'success', text: 'Proposition refusée : le site garde la version actuelle.' },
    );
  }

  async function save() {
    if (!data) return;
    const rules = blockRules[blockKey];
    const found = rules.check(data as never);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setResult({ tone: 'error', text: 'Des champs sont à corriger : ils sont signalés en rouge.' });
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus());
      return;
    }
    const clean = rules.normalize(data as never) as BlockData[K];
    setSaving(true);
    setResult(null);
    try {
      const db = supabase().from('content_blocks');
      const response = row
        ? await db.update(reviewing ? { data: clean, pending: null } : { data: clean }).eq('id', row.id).select('id, key, data, updated_at, updated_by, pending, pending_by').single()
        : await db.insert({ key: blockKey, data: clean, status: 'published' }).select('id, key, data, updated_at, updated_by, pending, pending_by').single();
      if (response.error) throw response.error;
      const next = response.data as BlockRow<K>;
      setRow(next);
      setReviewing(false);
      setData({ ...initial, ...next.data } as BlockData[K]);
      setResult(
        next.pending
          ? { tone: 'warning', text: 'Vos changements sont envoyés au Principal, qui les validera.' }
          : { tone: 'success', text: 'Enregistré. Les changements apparaîtront sur le site à la prochaine mise à jour (bouton « Mettre le site à jour » du tableau de bord).' },
      );
    } catch (cause) {
      setResult({ tone: 'error', text: frenchError(cause) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-28">
      <Link href="/admin/reglages/" className="inline-flex items-center gap-2 self-start font-semibold text-blue-600 hover:underline">
        <ArrowLeft aria-hidden="true" className="size-4.5" />
        Réglages
      </Link>
      <PageTitle title={title} intro={intro} />
      {row ? (
        <p className="-mt-3 text-sm text-muted">
          Dernière modification {relativeTime(row.updated_at)}
          {row.updated_by && names[row.updated_by] ? `, par ${names[row.updated_by]}` : ''}.
        </p>
      ) : null}
      {readOnly ? (
        <AdminAlert tone="info" title="Consultation seulement">
          {superAdminOnly
            ? 'Par sécurité, seul l’administrateur du site peut changer les numéros de paiement : un numéro modifié par erreur ou par malveillance détournerait l’argent des familles.'
            : 'Ces réglages sont modifiés par le Principal.'}
        </AdminAlert>
      ) : null}
      {proposal ? (
        <AdminAlert tone="warning" title="Proposition en attente">
          {row?.pending && row.pending_by
            ? 'Un membre de l’équipe a proposé une nouvelle version de ce réglage.'
            : 'EduFlow, le logiciel de gestion du collège, propose une nouvelle version de ce réglage.'}{' '}
          {me.can_publish ? (
            <span className="mt-3 flex flex-wrap gap-3">
              {!reviewing ? (
                <button type="button" onClick={review} className={buttonClass('secondary')}>Afficher la proposition</button>
              ) : null}
              <button type="button" disabled={saving} onClick={() => void decide(true)} className={buttonClass('primary', 'disabled:opacity-50')}>Valider</button>
              <button type="button" disabled={saving} onClick={() => void decide(false)} className={buttonClass('secondary', 'disabled:opacity-50')}>Refuser</button>
            </span>
          ) : (
            'Le Principal décidera de sa mise en ligne.'
          )}
        </AdminAlert>
      ) : null}
      {loadError ? <AdminAlert tone="error">{loadError}</AdminAlert> : null}
      {!data ? (
        loadError ? null : <Spinner label="Chargement" />
      ) : (
        form({ data, set, errors, schoolId: me.school.id, readOnly, me })
      )}

      {data && !readOnly ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 shadow-float backdrop-blur-sm lg:left-[17rem]">
          <div className="mx-auto flex max-w-4xl flex-col gap-2">
            {result ? <AdminAlert tone={result.tone}>{result.text}</AdminAlert> : null}
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void save()} disabled={saving || !dirty} className={buttonClass('primary', 'disabled:opacity-50')}>
                <Save aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <span className="text-sm text-muted" aria-live="polite">
                {dirty ? 'Modifications non enregistrées.' : 'Tout est enregistré.'}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BlockEditorPage<K extends BlockKey>(props: EditorProps<K>) {
  return (
    <AdminShell>
      <Editor {...props} />
    </AdminShell>
  );
}
