'use client';

import { useCallback, useEffect, useState } from 'react';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { frenchError, supabase } from '../client';
import { actionLabel, describeTarget } from '../labels';
import { useStaffNames } from '../content/review';
import { AdminShell } from '../shell';
import { AdminAlert, PageTitle, Spinner } from '../ui';

type Entry = { id: number; action: string; entity: string; label: string; at: string; actor: string | null };

const PAGE = 50;

const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Douala' });
const timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala' });
const dayKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Douala' }).format(new Date(iso));

/** Qui a fait quoi, et quand : toutes les actions de l'équipe, de la plus récente à la plus ancienne. */
function Journal() {
  const names = useStaffNames();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [more, setMore] = useState(false);
  const [actor, setActor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (before?: number) => {
      setLoading(true);
      let query = supabase().from('activity_log').select('id, action, entity, label, at, actor').order('id', { ascending: false }).limit(PAGE + 1);
      if (actor) query = query.eq('actor', actor);
      if (before) query = query.lt('id', before);
      const { data, error: failure } = await query;
      setLoading(false);
      if (failure) {
        setError(frenchError(failure));
        return;
      }
      const rows = (data ?? []) as Entry[];
      setMore(rows.length > PAGE);
      setEntries((current) => [...(before && current ? current : []), ...rows.slice(0, PAGE)]);
    },
    [actor],
  );

  useEffect(() => {
    setEntries(null);
    void load();
  }, [load]);

  const days: { key: string; items: Entry[] }[] = [];
  for (const entry of entries ?? []) {
    const key = dayKey(entry.at);
    if (days.at(-1)?.key !== key) days.push({ key, items: [] });
    days.at(-1)!.items.push(entry);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageTitle title="Journal" intro="Chaque création, modification, validation et archivage, avec son auteur. Utile pour retrouver qui a changé quoi." />
      <label className="flex max-w-xs flex-col gap-1.5">
        <span className="font-semibold">Personne</span>
        <select value={actor} onChange={(e) => setActor(e.target.value)} className={inputClass()}>
          <option value="">Toute l’équipe</option>
          {Object.entries(names).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
      {!entries ? (
        <Spinner label="Chargement du journal" />
      ) : entries.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-muted">Rien dans le journal pour l’instant.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {days.map((day) => (
            <section key={day.key} aria-label={dayFormat.format(new Date(day.items[0].at))} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-muted uppercase first-letter:uppercase">{dayFormat.format(new Date(day.items[0].at))}</h2>
              <ol className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-white">
                {day.items.map((item) => (
                  <li key={item.id} className="flex gap-4 px-4 py-3">
                    <time dateTime={item.at} className="w-12 shrink-0 text-sm text-muted tabular-nums">
                      {timeFormat.format(new Date(item.at))}
                    </time>
                    <span className="text-[15px] leading-6">
                      <strong>{(item.actor && names[item.actor]) || 'Quelqu’un'}</strong> {actionLabel[item.action] ?? item.action}{' '}
                      {describeTarget(item.entity, item.label)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
          {more ? (
            <button type="button" disabled={loading} onClick={() => void load(entries.at(-1)?.id)} className={cn(buttonClass('secondary'), 'self-center disabled:opacity-60')}>
              {loading ? 'Chargement…' : 'Voir les actions plus anciennes'}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function JournalPage() {
  return (
    <AdminShell>
      <Journal />
    </AdminShell>
  );
}
