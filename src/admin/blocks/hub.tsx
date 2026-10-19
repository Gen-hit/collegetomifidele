'use client';

import { ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { frenchError, supabase } from '../client';
import { relativeTime } from '../labels';
import { useMe } from '../session';
import { AdminShell } from '../shell';
import { AdminAlert, AdminCard, PageTitle, Spinner } from '../ui';
import { CheckField, NumberField } from './inputs';
import { blockPages } from './pages';

type Settings = { secretariat_can_publish: boolean; monthly_publish_limit: number };

/** Droits de publication du secrétariat et plafond mensuel des mises à jour. */
function PublishingRules() {
  const me = useMe();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase()
      .from('school_settings')
      .select('secretariat_can_publish, monthly_publish_limit')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setMessage({ tone: 'error', text: frenchError(error) });
        else if (data) {
          setSettings(data as Settings);
          setLimit((data as Settings).monthly_publish_limit);
        }
      });
  }, []);

  async function save(changes: Partial<Settings>) {
    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase()
      .from('school_settings')
      .update({ ...changes, updated_by: me.id, updated_at: new Date().toISOString() })
      .eq('school_id', me.school.id)
      .select('secretariat_can_publish, monthly_publish_limit')
      .single();
    setBusy(false);
    if (error) setMessage({ tone: 'error', text: frenchError(error) });
    else {
      setSettings(data as Settings);
      setMessage({ tone: 'success', text: 'Réglage enregistré.' });
    }
  }

  if (!settings) return message ? <AdminAlert tone="error">{message.text}</AdminAlert> : <Spinner label="Chargement" />;
  return (
    <AdminCard title="Validation des contenus">
      <CheckField
        label="Le secrétariat publie sans attendre ma validation"
        hint="Décoché (conseillé) : les actualités, dates, photos et documents saisis par le secrétariat attendent la validation du Principal dans « À valider »."
        checked={settings.secretariat_can_publish}
        disabled={busy}
        onChange={(value) => void save({ secretariat_can_publish: value })}
      />
      {me.role === 'super_admin' ? (
        <div className="flex flex-wrap items-end gap-3 border-t border-line pt-4">
          <NumberField
            className="w-56"
            grouped={false}
            label="Mises à jour du site par mois"
            value={limit}
            onChange={setLimit}
            hint="L’hébergement gratuit en permet une vingtaine."
            error={limit !== null && (Number.isNaN(limit) || limit < 1 || limit > 500) ? 'Entre 1 et 500.' : undefined}
          />
          <button
            type="button"
            disabled={busy || limit === null || Number.isNaN(limit) || limit < 1 || limit > 500 || limit === settings.monthly_publish_limit}
            onClick={() => void save({ monthly_publish_limit: limit ?? 20 })}
            className="mb-7 min-h-12 rounded-[10px] border-[1.5px] border-blue-600 px-4 font-semibold text-blue-600 disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      ) : null}
      {message ? <AdminAlert tone={message.tone}>{message.text}</AdminAlert> : null}
    </AdminCard>
  );
}

function Hub() {
  const me = useMe();
  const [updated, setUpdated] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase()
      .from('content_blocks')
      .select('key, updated_at')
      .then(({ data }) => setUpdated(Object.fromEntries((data ?? []).map((b) => [b.key as string, b.updated_at as string]))));
  }, []);

  if (me.role === 'secretariat') {
    return <AdminAlert tone="info">Les réglages du collège sont gérés par le Principal.</AdminAlert>;
  }
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageTitle title="Réglages" intro="Les informations du collège qui changent rarement : coordonnées, frais, résultats, équipe, photos. Chaque changement apparaît sur le site à la prochaine mise à jour." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {blockPages.map((page) => (
          <li key={page.key}>
            <Link href={page.path} className="flex h-full items-start gap-3 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-navy-700">
              <span className="flex flex-1 flex-col gap-1">
                <span className="flex items-center gap-2 font-semibold text-navy-700">
                  {page.title}
                  {page.superAdminOnly ? <Lock aria-label="Réservé à l’administrateur du site" className="size-4 text-muted" /> : null}
                </span>
                <span className="text-[15px] leading-6 text-muted">{page.summary}</span>
                {updated[page.key] ? <span className="text-sm text-muted">{`Modifié ${relativeTime(updated[page.key])}`}</span> : null}
              </span>
              <ChevronRight aria-hidden="true" className="mt-0.5 size-5 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
      <PublishingRules />
    </div>
  );
}

export function SettingsHubPage() {
  return (
    <AdminShell>
      <Hub />
    </AdminShell>
  );
}
