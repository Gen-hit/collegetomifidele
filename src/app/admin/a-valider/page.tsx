'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { frenchError, supabase } from '@/admin/client';
import { contentConfigs } from '@/admin/content/config';
import { StatusBadges, useStaffNames } from '@/admin/content/review';
import type { ContentRow } from '@/admin/content/types';
import { relativeTime } from '@/admin/labels';
import { useMe } from '@/admin/session';
import { AdminShell } from '@/admin/shell';
import { AdminAlert, PageTitle, Spinner } from '@/admin/ui';

type Item = { row: ContentRow; table: keyof typeof contentConfigs };

function ToReview() {
  const me = useMe();
  const names = useStaffNames();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const tables = Object.keys(contentConfigs) as (keyof typeof contentConfigs)[];
        const results = await Promise.all(
          tables.map((table) => supabase().from(table).select('*').or('status.eq.submitted,pending.not.is.null').order('updated_at', { ascending: false })),
        );
        const list: Item[] = [];
        results.forEach((res, i) => {
          if (res.error) throw res.error;
          for (const row of (res.data ?? []) as ContentRow[]) {
            if (row.deleted_at && !row.pending) continue;
            list.push({ row, table: tables[i] });
          }
        });
        list.sort((a, b) => String(b.row.pending_at ?? b.row.updated_at).localeCompare(String(a.row.pending_at ?? a.row.updated_at)));
        setItems(list);
      } catch (cause) {
        setError(frenchError(cause));
      }
    })();
  }, []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageTitle
        title="À valider"
        intro={
          me.can_publish
            ? 'Les nouveaux contenus envoyés et les modifications proposées par l’équipe. Ouvrez-les pour les relire, puis validez ou refusez.'
            : 'Vos envois et propositions en attente de la décision du Principal.'
        }
      />
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
      {!items ? (
        <Spinner label="Chargement" />
      ) : items.length === 0 ? (
        <AdminAlert tone="success" title="Rien en attente">Tout ce qui a été envoyé a déjà été traité.</AdminAlert>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map(({ row, table }) => {
            const config = contentConfigs[table];
            const who = (row.pending ? row.pending_by : row.updated_by) as string | null;
            return (
              <li key={`${table}-${row.id}`}>
                <Link href={`${config.path}modifier/?id=${row.id}`} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-navy-700 sm:p-5">
                  <span className="text-[13px] font-semibold tracking-[0.06em] text-blue-600 uppercase">{config.title}</span>
                  <span className="font-semibold text-navy-700">{config.titleOf(row) || 'Sans titre'}</span>
                  <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    <StatusBadges row={row} />
                    {`${(who && names[who]) || 'Un membre de l’équipe'}, ${relativeTime(String(row.pending_at ?? row.updated_at))}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AdminShell>
      <ToReview />
    </AdminShell>
  );
}
