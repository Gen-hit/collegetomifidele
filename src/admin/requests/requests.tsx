'use client';

import { Archive, ArchiveRestore, ChevronDown, Download, Phone, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { frenchError, supabase } from '../client';
import { relativeTime } from '../labels';
import { useMe } from '../session';
import { AdminShell } from '../shell';
import { useStaffNames } from '../content/review';
import { AdminAlert, Badge, PageTitle, Spinner } from '../ui';
import {
  classLine,
  dateTime,
  displayPhone,
  matchesQuery,
  messagesCsv,
  messageStatuses,
  preinscriptionsCsv,
  preinscriptionStatuses,
  replyText,
  telHref,
  whatsappToFamily,
  type ContactMessage,
  type Preinscription,
  type RequestTable,
} from './model';

type Row = Preinscription | ContactMessage;
type Tab = 'preinscriptions' | 'messages';
type Filter = 'todo' | 'new' | 'done' | 'closed' | 'archived' | 'all';

const tableOf: Record<Tab, RequestTable> = { preinscriptions: 'preinscriptions', messages: 'contact_messages' };

const filterSets: Record<Tab, { id: Filter; label: string }[]> = {
  preinscriptions: [
    { id: 'todo', label: 'À traiter' },
    { id: 'new', label: 'Nouvelles' },
    { id: 'done', label: 'Confirmées' },
    { id: 'closed', label: 'Sans suite' },
    { id: 'archived', label: 'Archivées' },
    { id: 'all', label: 'Toutes' },
  ],
  messages: [
    { id: 'todo', label: 'À traiter' },
    { id: 'done', label: 'Traités' },
    { id: 'archived', label: 'Archivés' },
    { id: 'all', label: 'Tous' },
  ],
};

function matchesFilter(row: Row, filter: Filter): boolean {
  if (filter === 'archived') return Boolean(row.deleted_at);
  if (row.deleted_at) return false;
  switch (filter) {
    case 'todo':
      return row.status === 'new' || row.status === 'contacted';
    case 'new':
      return row.status === 'new';
    case 'done':
      return row.status === 'accepted' || row.status === 'handled';
    case 'closed':
      return row.status === 'rejected';
    default:
      return true;
  }
}

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Douala' }).format(new Date());
}

/** Une demande, repliée (l'essentiel) ou dépliée (tout le détail et les actions). */
function RequestItem({ tab, row, onChange }: { tab: Tab; row: Row; onChange: (row: Row) => void }) {
  const me = useMe();
  const names = useStaffNames();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(row.internal_note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const table = tableOf[tab];
  const p = tab === 'preinscriptions' ? (row as Preinscription) : null;
  const m = tab === 'messages' ? (row as ContactMessage) : null;
  const statuses = p ? preinscriptionStatuses : messageStatuses;
  const status = statuses.find((s) => s.id === row.status) ?? statuses[0];
  const phone = p ? p.parent_phone : (m?.phone ?? '');
  const title = p ? p.student_name : (m?.name ?? '');
  const detailId = `demande-${row.id}`;

  async function update(values: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const { data, error: failure } = await supabase().from(table).update(values).eq('id', row.id).select().single();
      if (failure) throw failure;
      onChange(data as Row);
      return true;
    } catch (cause) {
      setError(frenchError(cause));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={cn('rounded-2xl border bg-white transition-colors', row.status === 'new' && !row.deleted_at ? 'border-gold-300' : 'border-line', open && 'border-navy-700')}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 p-4 text-left sm:items-center"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-navy-700">{title}</span>
            {p ? <span className="font-mono text-sm text-muted">{p.reference}</span> : null}
          </span>
          <span className="text-[15px] text-ink">{p ? classLine(p) : m?.subject}</span>
          <span className="text-sm text-muted">
            {p ? `${p.parent_name} · ` : ''}
            {displayPhone(phone)} · reçue {relativeTime(row.created_at)}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          {row.deleted_at ? <Badge tone="red">Archivée</Badge> : <Badge tone={status.tone}>{status.label}</Badge>}
          <ChevronDown aria-hidden="true" className={cn('size-5 text-muted transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open ? (
        <div id={detailId} className="flex flex-col gap-5 border-t border-line p-4 sm:p-5">
          {(p?.message || m?.message) ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted">Message de la famille</span>
              <p className="rounded-xl bg-surface-alt p-3 text-[15px] leading-6 whitespace-pre-wrap">{p ? p.message : m?.message}</p>
            </div>
          ) : null}

          <dl className="grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-2">
            {p ? (
              <>
                <div><dt className="inline text-muted">Élève : </dt><dd className="inline font-semibold">{p.student_name}</dd></div>
                <div><dt className="inline text-muted">Classe demandée : </dt><dd className="inline font-semibold">{classLine(p)}</dd></div>
                <div><dt className="inline text-muted">Parent ou tuteur : </dt><dd className="inline font-semibold">{p.parent_name}</dd></div>
              </>
            ) : (
              <div><dt className="inline text-muted">Sujet : </dt><dd className="inline font-semibold">{m?.subject}</dd></div>
            )}
            <div><dt className="inline text-muted">Téléphone : </dt><dd className="inline font-semibold">{displayPhone(phone)}</dd></div>
            <div><dt className="inline text-muted">Reçue le : </dt><dd className="inline">{dateTime(row.created_at)}</dd></div>
            <div><dt className="inline text-muted">Langue du site : </dt><dd className="inline">{row.locale === 'en' ? 'anglais' : 'français'}</dd></div>
            {row.handled_by ? (
              <div className="sm:col-span-2"><dt className="inline text-muted">Dernière action : </dt><dd className="inline">{names[row.handled_by] ?? 'un membre de l’équipe'}, {relativeTime(row.updated_at)}</dd></div>
            ) : null}
          </dl>

          {phone ? (
            <div className="flex flex-wrap gap-3">
              <a href={telHref(phone)} className={buttonClass('primary')}>
                <Phone aria-hidden="true" className="size-5" strokeWidth={1.75} />
                Appeler
              </a>
              <a href={whatsappToFamily(phone, replyText(table, row))} target="_blank" rel="noopener noreferrer" className={buttonClass('whatsapp')}>
                <FaWhatsapp aria-hidden="true" className="size-5" />
                Répondre sur WhatsApp
              </a>
            </div>
          ) : null}

          {!row.deleted_at ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold text-muted">Suite donnée</legend>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={busy}
                    aria-pressed={row.status === s.id}
                    onClick={() => void update({ status: s.id, handled_by: me.id })}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-full border px-4 text-[15px] font-semibold transition-colors disabled:opacity-60',
                      row.status === s.id ? 'border-navy-700 bg-navy-700 text-white' : 'border-line bg-white text-navy-700 hover:border-navy-700',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="flex flex-col gap-2">
            <label htmlFor={`${detailId}-note`} className="text-sm font-semibold text-muted">
              Note interne (jamais visible par la famille)
            </label>
            <textarea
              id={`${detailId}-note`}
              rows={3}
              value={note}
              maxLength={2000}
              onChange={(event) => {
                setNote(event.target.value);
                setSaved(false);
              }}
              placeholder="Ex. : rappelé le 20/10, dossier à déposer lundi."
              className={cn(inputClass(), 'py-3')}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy || note === row.internal_note}
                onClick={async () => {
                  if (await update({ internal_note: note, handled_by: me.id })) setSaved(true);
                }}
                className={buttonClass('secondary', 'disabled:opacity-50')}
              >
                Enregistrer la note
              </button>
              {saved ? <span role="status" className="text-sm font-semibold text-green-800">Note enregistrée</span> : null}
            </div>
          </div>

          {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

          <div className="flex justify-end border-t border-line pt-4">
            {row.deleted_at ? (
              <button type="button" disabled={busy} onClick={() => void update({ deleted_at: null, handled_by: me.id })} className="inline-flex min-h-11 items-center gap-2 px-2 font-semibold text-blue-600 underline underline-offset-4">
                <ArchiveRestore aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                Remettre dans la liste
              </button>
            ) : (
              <button type="button" disabled={busy} onClick={() => void update({ deleted_at: new Date().toISOString(), handled_by: me.id })} className="inline-flex min-h-11 items-center gap-2 px-2 font-semibold text-muted underline underline-offset-4 hover:text-red-700">
                <Archive aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                Archiver
              </button>
            )}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function Requests() {
  const params = useSearchParams();
  const names = useStaffNames();
  const [tab, setTab] = useState<Tab>(params.get('vue') === 'messages' ? 'messages' : 'preinscriptions');
  const [filter, setFilter] = useState<Filter>('todo');
  const [query, setQuery] = useState('');
  const [className, setClassName] = useState('');
  const [data, setData] = useState<{ preinscriptions: Preinscription[]; messages: ContactMessage[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Une demande que l'on vient de traiter reste sous les yeux jusqu'au prochain changement de liste,
  // au lieu de disparaître au premier clic (et de laisser croire à une erreur).
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setError(null);
    try {
      const client = supabase();
      const [pre, msg] = await Promise.all([
        client.from('preinscriptions').select('*').order('created_at', { ascending: false }).limit(1000),
        client.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(1000),
      ]);
      if (pre.error) throw pre.error;
      if (msg.error) throw msg.error;
      setData({ preinscriptions: pre.data as Preinscription[], messages: msg.data as ContactMessage[] });
    } catch (cause) {
      setError(frenchError(cause));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows: Row[] = useMemo(() => (data ? data[tab] : []), [data, tab]);
  const filters = filterSets[tab];
  const counts = useMemo(() => Object.fromEntries(filters.map((f) => [f.id, rows.filter((r) => matchesFilter(r, f.id)).length])), [rows, filters]);
  const classes = useMemo(
    () => (tab === 'preinscriptions' ? [...new Set((rows as Preinscription[]).map((r) => r.target_class))].sort((a, b) => a.localeCompare(b, 'fr')) : []),
    [rows, tab],
  );
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (matchesFilter(r, filter) || touched.has(r.id)) &&
          (!className || (r as Preinscription).target_class === className) &&
          matchesQuery(r, query),
      ),
    [rows, filter, className, query, touched],
  );
  const todo = (list: Row[]) => list.filter((r) => !r.deleted_at && r.status === 'new').length;

  function replace(next: Row) {
    setTouched((current) => new Set(current).add(next.id));
    setData((current) =>
      current
        ? {
            ...current,
            [tab]: (current[tab] as Row[]).map((r) => (r.id === next.id ? next : r)),
          }
        : current,
    );
  }

  function exportCsv() {
    const csv =
      tab === 'preinscriptions'
        ? preinscriptionsCsv(shown as Preinscription[], names)
        : messagesCsv(shown as ContactMessage[], names);
    download(`${tab === 'preinscriptions' ? 'preinscriptions' : 'messages'}-${today()}.csv`, csv);
  }

  function switchTab(next: Tab) {
    setTab(next);
    setFilter('todo');
    setClassName('');
    setTouched(new Set());
  }

  function switchFilter(next: Filter) {
    setFilter(next);
    setTouched(new Set());
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Demandes des familles"
          intro="Les préinscriptions et les messages envoyés depuis le site. Rappelez la famille, notez la suite donnée : toute l’équipe voit où en est chaque demande."
        />
        <button type="button" onClick={exportCsv} disabled={!data || shown.length === 0} className={buttonClass('secondary', 'disabled:opacity-50')}>
          <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
          Exporter pour Excel
        </button>
      </div>

      <div role="tablist" aria-label="Type de demande" className="flex gap-2 border-b border-line">
        {(['preinscriptions', 'messages'] as Tab[]).map((id) => {
          const count = data ? todo(data[id]) : 0;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => switchTab(id)}
              className={cn(
                '-mb-px inline-flex min-h-12 items-center gap-2 border-b-[3px] px-3 text-base font-semibold transition-colors',
                tab === id ? 'border-navy-700 text-navy-700' : 'border-transparent text-muted hover:text-navy-700',
              )}
            >
              {id === 'preinscriptions' ? 'Préinscriptions' : 'Messages'}
              {count > 0 ? <span className="rounded-full bg-gold-400 px-2 text-xs leading-5 font-bold text-ink">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrer">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => switchFilter(f.id)}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors',
                filter === f.id ? 'border-navy-700 bg-navy-700 text-white' : 'border-line bg-white text-navy-700 hover:border-navy-700',
              )}
            >
              {f.label}
              {data ? <span className={cn('rounded-full px-2 text-xs leading-5', filter === f.id ? 'bg-indigo-900 text-white' : 'bg-surface-alt')}>{counts[f.id]}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="relative min-w-60 flex-1">
            <span className="sr-only">Rechercher</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'preinscriptions' ? 'Nom, numéro P26-…, téléphone…' : 'Nom, téléphone, mot du message…'}
              className={cn(inputClass(), 'pl-10')}
            />
          </label>
          {tab === 'preinscriptions' && classes.length > 1 ? (
            <label className="min-w-52">
              <span className="sr-only">Classe demandée</span>
              <select value={className} onChange={(e) => setClassName(e.target.value)} className={inputClass()}>
                <option value="">Classe : toutes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
      {!data && !error ? (
        <Spinner label="Chargement des demandes" />
      ) : data && shown.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-muted">
          {rows.length === 0
            ? tab === 'preinscriptions'
              ? 'Aucune préinscription reçue pour l’instant. Elles arrivent ici dès qu’une famille remplit le formulaire du site.'
              : 'Aucun message reçu pour l’instant.'
            : 'Aucune demande dans cette liste.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((row) => (
            <RequestItem key={row.id} tab={tab} row={row} onChange={replace} />
          ))}
        </ul>
      )}

      <p className="text-sm text-muted">
        Les demandes de plus de 12 mois sont effacées automatiquement, comme annoncé aux familles sur la page Confidentialité.
      </p>
    </div>
  );
}

export function RequestsPage() {
  return (
    <AdminShell>
      <Suspense fallback={<Spinner label="Chargement" />}>
        <Requests />
      </Suspense>
    </AdminShell>
  );
}
