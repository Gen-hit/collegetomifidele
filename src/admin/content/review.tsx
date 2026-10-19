'use client';

import { Check, Undo2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buttonClass } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { frenchError, supabase } from '../client';
import { relativeTime } from '../labels';
import type { Me } from '../session';
import { AdminAlert, Badge } from '../ui';
import { approveProposal, fileUrl, rejectProposal, setStatus } from './api';
import { shortDate } from './config';
import type { ContentConfig, ContentRow, FieldConfig } from './types';

// ── Noms des membres de l'équipe (pour « proposé par … ») ──────────────────────────────────
let namesCache: Promise<Record<string, string>> | null = null;
export function useStaffNames(): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    namesCache ??= (async () => {
      const { data } = await supabase().from('profiles').select('id, full_name');
      return Object.fromEntries((data ?? []).map((p) => [p.id as string, (p.full_name as string) || 'Un membre de l’équipe']));
    })();
    let active = true;
    namesCache.then((n) => active && setNames(n)).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return names;
}

// ── Badges d'état ─────────────────────────────────────────────────────────────────────────
export function StatusBadges({ row }: { row: ContentRow }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {row.deleted_at ? (
        <Badge tone="red">Archivé</Badge>
      ) : row.status === 'published' ? (
        <Badge tone="green">En ligne</Badge>
      ) : row.status === 'submitted' ? (
        <Badge tone="gold">À valider</Badge>
      ) : (
        <Badge>Brouillon</Badge>
      )}
      {row.pending ? <Badge tone="gold">{row.pending._archive ? 'Archivage demandé' : 'Modification proposée'}</Badge> : null}
      {row.is_sample ? <Badge tone="blue">Modèle</Badge> : null}
    </span>
  );
}

// ── Comparaison champ par champ ───────────────────────────────────────────────────────────
type Line = { label: string; before: unknown; after: unknown; kind: FieldConfig['kind'] };

function diffLines(config: ContentConfig, row: ContentRow): Line[] {
  const proposal = row.pending ?? {};
  const lines: Line[] = [];
  for (const field of config.fields) {
    const columns = field.bilingual ? [`${field.name}_fr`, `${field.name}_en`] : [field.name];
    for (const column of columns) {
      if (!(column in proposal)) continue;
      const before = row[column] ?? null;
      const after = proposal[column] ?? null;
      if (JSON.stringify(before) === JSON.stringify(after)) continue;
      const suffix = field.bilingual ? (column.endsWith('_en') ? ' (anglais)' : ' (français)') : '';
      lines.push({ label: field.label + suffix, before, after, kind: field.kind });
    }
  }
  if (config.positionColumn && proposal[config.positionColumn] !== undefined && proposal[config.positionColumn] !== row[config.positionColumn]) {
    lines.push({ label: 'Place dans la liste', before: row[config.positionColumn], after: proposal[config.positionColumn], kind: 'text' });
  }
  return lines;
}

function Value({ value, kind, field }: { value: unknown; kind: FieldConfig['kind']; field?: FieldConfig }) {
  if (value === null || value === undefined || value === '') return <span className="text-muted italic">vide</span>;
  if (kind === 'image') {
    const src = fileUrl(value);
    // eslint-disable-next-line @next/next/no-img-element
    return src ? <img src={src} alt="" className="h-20 w-32 rounded-lg object-cover" /> : null;
  }
  if (kind === 'pdf') return <a href={fileUrl(value) ?? '#'} target="_blank" rel="noopener" className="font-semibold text-blue-600 underline">{String(value).split('/').pop()}</a>;
  if (kind === 'date') return <>{shortDate(value)}</>;
  if (kind === 'checkbox') return <>{value ? 'Oui' : 'Non'}</>;
  if (kind === 'select') return <>{field?.options?.find((o) => o.value === value)?.label ?? String(value)}</>;
  const text = String(value);
  return <span className="whitespace-pre-line">{text.length > 600 ? `${text.slice(0, 600)}…` : text}</span>;
}

type PanelProps = { config: ContentConfig; row: ContentRow; me: Me; onChange: (row: ContentRow) => void };

/** Ce qui attend une décision sur la fiche : une proposition, ou un nouveau contenu soumis. */
export function ReviewPanel({ config, row, me, onChange }: PanelProps) {
  const names = useStaffNames();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<ContentRow>) {
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
    } catch (cause) {
      setError(frenchError(cause));
    } finally {
      setBusy(false);
    }
  }

  const who = (id: string | null) => (id && names[id]) || 'Un membre de l’équipe';
  const box = 'flex flex-col gap-4 rounded-2xl border border-gold-300 bg-gold-100 p-5';

  if (row.pending) {
    const archive = Boolean(row.pending._archive);
    const mine = row.pending_by === me.id;
    const lines = archive ? [] : diffLines(config, row);
    return (
      <section className={box} aria-labelledby="proposition">
        <div className="flex flex-col gap-1">
          <h2 id="proposition" className="font-display text-xl font-bold text-navy-700">
            {archive ? 'Demande d’archivage' : 'Modification proposée'}
          </h2>
          <p className="text-[15px]">
            {mine ? 'Vous avez proposé' : `${who(row.pending_by)} a proposé`} {archive ? 'de retirer ce contenu du site' : 'ces changements'}
            {row.pending_at ? `, ${relativeTime(row.pending_at)}` : ''}. {me.can_publish ? '' : 'La version en ligne reste en place jusqu’à la décision du Principal.'}
          </p>
        </div>
        {lines.length ? (
          <div className="overflow-x-auto rounded-xl border border-gold-300 bg-white">
            <table className="w-full min-w-[34rem] text-left text-[15px]">
              <thead className="bg-surface-alt text-sm text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Champ</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">En ligne</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Proposé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line align-top">
                {lines.map((line) => (
                  <tr key={line.label}>
                    <th scope="row" className="px-4 py-3 font-semibold">{line.label}</th>
                    <td className="px-4 py-3 text-muted"><Value value={line.before} kind={line.kind} field={config.fields.find((f) => line.label.startsWith(f.label))} /></td>
                    <td className="bg-green-100/50 px-4 py-3"><Value value={line.after} kind={line.kind} field={config.fields.find((f) => line.label.startsWith(f.label))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
        <div className="flex flex-wrap gap-2">
          {me.can_publish ? (
            <>
              <button type="button" disabled={busy} className={buttonClass('primary', 'disabled:opacity-60')} onClick={() => void run(() => approveProposal(config, row))}>
                <Check aria-hidden="true" className="size-5" />
                {archive ? 'Archiver' : 'Valider la proposition'}
              </button>
              <button type="button" disabled={busy} className={buttonClass('secondary', 'disabled:opacity-60')} onClick={() => void run(() => rejectProposal(config, row))}>
                <X aria-hidden="true" className="size-5" />
                Refuser
              </button>
            </>
          ) : (
            <button type="button" disabled={busy} className={buttonClass('secondary', 'disabled:opacity-60')} onClick={() => void run(() => rejectProposal(config, row))}>
              <Undo2 aria-hidden="true" className="size-5" />
              Retirer la proposition
            </button>
          )}
        </div>
      </section>
    );
  }

  if (row.status === 'submitted' && !row.deleted_at) {
    return (
      <section className={cn(box)} aria-labelledby="a-valider">
        <h2 id="a-valider" className="font-display text-xl font-bold text-navy-700">
          {me.can_publish ? 'À valider' : 'Envoyé au Principal'}
        </h2>
        <p className="text-[15px]">
          {me.can_publish
            ? `${who(row.updated_by)} a envoyé ce contenu pour validation. Relisez-le ci-dessous, puis publiez-le ou renvoyez-le en brouillon.`
            : 'Ce contenu attend la validation du Principal. Vous pouvez encore le corriger.'}
        </p>
        {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
        {me.can_publish ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} className={buttonClass('primary', 'disabled:opacity-60')} onClick={() => void run(() => setStatus(config, row, 'published'))}>
              <Check aria-hidden="true" className="size-5" />
              Valider et publier
            </button>
            <button type="button" disabled={busy} className={buttonClass('secondary', 'disabled:opacity-60')} onClick={() => void run(() => setStatus(config, row, 'draft'))}>
              <Undo2 aria-hidden="true" className="size-5" />
              Renvoyer en brouillon
            </button>
          </div>
        ) : null}
      </section>
    );
  }
  return null;
}
