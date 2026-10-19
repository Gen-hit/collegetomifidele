'use client';

import { CalendarDays, FileText, Images, Newspaper, RefreshCw, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { frenchError, supabase } from '@/admin/client';
import { actionLabel, describeTarget, firstName, relativeTime, roleLabel } from '@/admin/labels';
import { useMe } from '@/admin/session';
import { AdminShell } from '@/admin/shell';
import { AdminAlert, AdminCard, Badge, PageTitle, Spinner } from '@/admin/ui';
import { buttonClass } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PublishStatus = {
  lastSuccess: { at: string; status: string; by_name: string | null } | null;
  lastRequest: { at: string; status: string; detail: string; by_name: string | null } | null;
  changesSinceLast: number;
  toReview: number;
  monthCount: number;
  monthlyLimit: number;
};

type Counts = { published: number; draft: number; review: number };
type Activity = { id: number; action: string; entity: string; label: string; at: string; actor: string | null };

const sections: { table: string; label: string; Icon: LucideIcon; tone: string; path: string }[] = [
  { table: 'news', label: 'Actualités', Icon: Newspaper, tone: 'bg-sky-100 text-blue-600', path: '/admin/actualites/' },
  { table: 'calendar_events', label: 'Dates du calendrier', Icon: CalendarDays, tone: 'bg-gold-100 text-gold-700', path: '/admin/calendrier/' },
  { table: 'gallery_photos', label: 'Photos de la galerie', Icon: Images, tone: 'bg-green-100 text-green-700', path: '/admin/galerie/' },
  { table: 'documents', label: 'Documents', Icon: FileText, tone: 'bg-sky-100 text-navy-700', path: '/admin/documents/' },
];

function Dashboard() {
  const me = useMe();
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [requests, setRequests] = useState<{ preinscriptions: number; messages: number } | null>(null);
  const [counts, setCounts] = useState<Record<string, Counts>>({});
  const [activity, setActivity] = useState<Activity[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const load = useCallback(async () => {
    const db = supabase();
    try {
      const [statusRes, requestsRes, activityRes, profilesRes, ...tables] = await Promise.all([
        db.rpc('publish_status'),
        db.rpc('requests_status'),
        db.from('activity_log').select('id, action, entity, label, at, actor').order('at', { ascending: false }).limit(8),
        db.from('profiles').select('id, full_name'),
        ...sections.map((s) => db.from(s.table).select('status, pending, deleted_at')),
      ]);
      for (const res of [statusRes, requestsRes, activityRes, profilesRes, ...tables]) if (res.error) throw res.error;
      setStatus(statusRes.data as PublishStatus);
      setRequests(requestsRes.data as { preinscriptions: number; messages: number });
      setActivity((activityRes.data ?? []) as Activity[]);
      setNames(Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id as string, p.full_name as string])));
      const next: Record<string, Counts> = {};
      sections.forEach((s, i) => {
        const rows = (tables[i].data ?? []) as { status: string; pending: unknown; deleted_at: string | null }[];
        const live = rows.filter((r) => !r.deleted_at);
        next[s.table] = {
          published: live.filter((r) => r.status === 'published').length,
          draft: live.filter((r) => r.status === 'draft').length,
          review: live.filter((r) => r.status === 'submitted' || r.pending).length,
        };
      });
      setCounts(next);
      setLoadError(null);
    } catch (error) {
      setLoadError(frenchError(error));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function publish() {
    setPublishing(true);
    setResult(null);
    const { data, error } = await supabase().functions.invoke('publish', { method: 'POST' });
    if (error) {
      let text = frenchError(error);
      // La fonction renvoie un message en français dans le corps de sa réponse.
      const response = (error as { context?: Response }).context;
      if (response && typeof response.json === 'function') {
        try {
          const body = await response.json();
          if (body?.message) text = body.message;
        } catch {
          // corps illisible : on garde le message générique
        }
      }
      setResult({ tone: response?.status === 503 ? 'warning' : 'error', text });
    } else {
      setResult({ tone: 'success', text: data?.message ?? 'Mise à jour lancée.' });
    }
    setPublishing(false);
    void load();
  }

  const quotaLeft = status ? Math.max(0, status.monthlyLimit - status.monthCount) : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <PageTitle
        eyebrow={roleLabel[me.role]}
        title={`Bonjour${me.full_name ? ` ${firstName(me.full_name)}` : ''}`}
        intro="Ce qui attend une action, et l’état du site en ligne."
      />

      {loadError ? (
        <AdminAlert tone="error" title="Impossible de charger le tableau de bord">
          {loadError}{' '}
          <button type="button" className="font-semibold underline" onClick={() => void load()}>
            Réessayer
          </button>
        </AdminAlert>
      ) : null}

      <AdminCard
        title="Mettre le site à jour"
        action={status ? <Badge tone={quotaLeft === 0 ? 'red' : 'neutral'}>{`${status.monthCount} sur ${status.monthlyLimit} ce mois-ci`}</Badge> : null}
      >
        {!status ? (
          <Spinner label="Chargement" />
        ) : (
          <div className="flex flex-col gap-4">
            <p>
              {status.changesSinceLast > 0 ? (
                <>
                  <strong>
                    {status.changesSinceLast} {status.changesSinceLast > 1 ? 'changements validés attendent' : 'changement validé attend'}
                  </strong>{' '}
                  la prochaine mise à jour du site.
                </>
              ) : (
                'Le site en ligne est à jour : aucun changement validé depuis la dernière mise à jour.'
              )}
            </p>
            {status.lastSuccess ? (
              <p className="text-[15px] text-muted">
                Dernière mise à jour {relativeTime(status.lastSuccess.at)}
                {status.lastSuccess.by_name ? `, par ${status.lastSuccess.by_name}` : ''}.
              </p>
            ) : null}
            {status.lastRequest?.status === 'failed' ? (
              <AdminAlert tone="warning" title="La dernière demande n’a pas abouti">
                {status.lastRequest.detail}
              </AdminAlert>
            ) : null}
            {me.can_publish ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void publish()}
                  disabled={publishing}
                  className={buttonClass('primary', 'self-start disabled:cursor-wait disabled:opacity-70')}
                >
                  <RefreshCw aria-hidden="true" className={cn('size-5', publishing && 'animate-spin')} strokeWidth={2} />
                  {publishing ? 'Demande en cours…' : 'Mettre le site à jour'}
                </button>
                <p className="text-sm text-muted">
                  Le site se reconstruit en une à deux minutes. Regroupez vos changements : l’hébergement gratuit permet
                  une vingtaine de mises à jour par mois.
                </p>
              </div>
            ) : (
              <p className="text-[15px] text-muted">Le Principal valide vos propositions et met le site à jour.</p>
            )}
            {result ? <AdminAlert tone={result.tone}>{result.text}</AdminAlert> : null}
          </div>
        )}
      </AdminCard>

      {status && status.toReview > 0 ? (
        <AdminAlert tone="info" title={me.can_publish ? 'À valider' : 'En attente de validation'}>
          {status.toReview} {status.toReview > 1 ? 'contenus attendent' : 'contenu attend'}{' '}
          {me.can_publish ? 'votre validation.' : 'la validation du Principal.'}{' '}
          <Link href="/admin/a-valider/" className="font-semibold text-blue-600 underline underline-offset-4">
            Voir la liste
          </Link>
        </AdminAlert>
      ) : null}

      {requests && requests.preinscriptions + requests.messages > 0 ? (
        <AdminAlert tone="warning" title="Demandes des familles">
          {[
            requests.preinscriptions ? `${requests.preinscriptions} préinscription${requests.preinscriptions > 1 ? 's' : ''}` : null,
            requests.messages ? `${requests.messages} message${requests.messages > 1 ? 's' : ''}` : null,
          ]
            .filter(Boolean)
            .join(' et ')}{' '}
          {requests.preinscriptions + requests.messages > 1 ? 'attendent' : 'attend'} une réponse.{' '}
          <Link
            href={requests.preinscriptions ? '/admin/demandes/' : '/admin/demandes/?vue=messages'}
            className="font-semibold text-blue-600 underline underline-offset-4"
          >
            Ouvrir les demandes
          </Link>
        </AdminAlert>
      ) : null}

      <section aria-labelledby="contenus" className="flex flex-col gap-4">
        <h2 id="contenus" className="font-display text-xl leading-7 font-bold text-navy-700">
          Les contenus du site
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sections.map(({ table, label, Icon, tone, path }) => {
            const c = counts[table];
            return (
              <li key={table} className="relative flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-navy-700">
                <span className={cn('flex size-11 items-center justify-center rounded-xl', tone)}>
                  <Icon aria-hidden="true" className="size-5.5" strokeWidth={1.75} />
                </span>
                <Link href={path} className="font-semibold text-navy-700 after:absolute after:inset-0">
                  {label}
                </Link>
                {c ? (
                  <span className="flex flex-wrap gap-2">
                    <Badge tone="green">{`${c.published} en ligne`}</Badge>
                    {c.review ? <Badge tone="gold">{`${c.review} à valider`}</Badge> : null}
                    {c.draft ? <Badge>{`${c.draft} brouillon${c.draft > 1 ? 's' : ''}`}</Badge> : null}
                  </span>
                ) : (
                  <Spinner label="Chargement" className="text-sm" />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <AdminCard title="Activité récente">
        {activity.length === 0 ? (
          <p className="text-muted">Aucune modification pour l’instant.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-line">
            {activity.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <span>
                  <strong>{(item.actor && names[item.actor]) || 'Quelqu’un'}</strong> {actionLabel[item.action] ?? item.action}{' '}
                  {describeTarget(item.entity, item.label)}
                </span>
                <span className="text-sm text-muted">{relativeTime(item.at)}</span>
              </li>
            ))}
          </ol>
        )}
      </AdminCard>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}
