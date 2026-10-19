'use client';

import { Check, Copy, HardDrive, Trash2, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { TextField } from '../blocks/inputs';
import { frenchError, supabase } from '../client';
import { relativeTime, roleLabel } from '../labels';
import { useMe, type Role } from '../session';
import { AdminShell } from '../shell';
import { AdminAlert, AdminCard, Badge, PageTitle, Spinner } from '../ui';

type Profile = { id: string; full_name: string; role: Role; active: boolean; created_at: string };
type Invitation = { id: string; email: string; full_name: string; role: Role; created_at: string; accepted_at: string | null };
type Orphan = { name: string; bytes: number; created_at: string };

const roles: { id: Role; hint: string }[] = [
  { id: 'secretariat', hint: 'Saisit les actualités, dates, photos et documents ; traite les demandes des familles.' },
  { id: 'principal', hint: 'Valide les contenus, met le site à jour, modifie les réglages du collège.' },
  { id: 'super_admin', hint: 'Tout, plus les comptes, les numéros de paiement et le ménage du stockage.' },
];

/** Le message à envoyer à la personne invitée : où aller, quelle adresse utiliser. */
export function invitationText(name: string, email: string, origin: string): string {
  const hello = name.trim() ? `Bonjour ${name.trim().split(/\s+/)[0]},` : 'Bonjour,';
  return `${hello}\n\nVous avez un accès à l’administration du site du collège.\n1. Ouvrez ${origin}/admin/connexion/\n2. Choisissez « Activer mon compte ».\n3. Saisissez l’adresse ${email} et choisissez votre mot de passe (8 caractères au moins).\n4. Ouvrez le lien de confirmation reçu par email.`;
}

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;

function Accounts() {
  const me = useMe();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', full_name: '', role: 'secretariat' as Role });
  const [formError, setFormError] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ email: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orphans, setOrphans] = useState<Orphan[] | null>(null);
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const db = supabase();
    const [p, i] = await Promise.all([
      db.from('profiles').select('id, full_name, role, active, created_at').order('created_at'),
      db.from('invitations').select('id, email, full_name, role, created_at, accepted_at').is('accepted_at', null).order('created_at', { ascending: false }),
    ]);
    if (p.error || i.error) setError(frenchError(p.error ?? i.error));
    else {
      setProfiles(p.data as Profile[]);
      setInvitations(i.data as Invitation[]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => PromiseLike<{ error: unknown }>) {
    setBusy(true);
    setError(null);
    const { error: failure } = await action();
    setBusy(false);
    if (failure) setError(frenchError(failure));
    await load();
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const errors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Adresse email incomplète.';
    if (form.full_name.trim().length < 3) errors.full_name = 'Indiquez le nom de la personne.';
    if (profiles && invitations.some((inv) => inv.email.toLowerCase() === email)) errors.email = 'Cette adresse a déjà une invitation en attente.';
    setFormError(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    setError(null);
    const { error: failure } = await supabase()
      .from('invitations')
      .insert({ school_id: me.school.id, email, full_name: form.full_name.trim(), role: form.role, invited_by: me.id });
    setBusy(false);
    if (failure) {
      setError(frenchError(failure));
      return;
    }
    setSent({ email, name: form.full_name });
    setCopied(false);
    setForm({ email: '', full_name: '', role: 'secretariat' });
    await load();
  }

  async function findOrphans() {
    setCleanMessage(null);
    const { data, error: failure } = await supabase().rpc('orphan_media');
    if (failure) setError(frenchError(failure));
    else setOrphans((data ?? []) as Orphan[]);
  }

  async function removeOrphans() {
    if (!orphans?.length) return;
    setBusy(true);
    const names = orphans.map((o) => o.name);
    let removed = 0;
    for (let i = 0; i < names.length; i += 100) {
      const { data, error: failure } = await supabase().storage.from('media').remove(names.slice(i, i + 100));
      if (failure) {
        setError(frenchError(failure));
        break;
      }
      removed += data?.length ?? 0;
    }
    setBusy(false);
    setCleanMessage(`${removed} fichier${removed > 1 ? 's' : ''} supprimé${removed > 1 ? 's' : ''}.`);
    setOrphans(null);
  }

  if (me.role !== 'super_admin') return <AdminAlert tone="info">Les comptes sont gérés par l’administrateur du site.</AdminAlert>;

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const message = sent ? invitationText(sent.name, sent.email, origin) : '';

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageTitle title="Comptes" intro="Qui a accès à l’administration, et avec quels droits. Une personne ne peut créer son compte qu’avec une adresse invitée ici." />
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      <AdminCard title="L’équipe">
        {!profiles ? (
          <Spinner label="Chargement" />
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {profiles.map((p) => {
              const self = p.id === me.id;
              return (
                <li key={p.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <span className="flex flex-1 flex-col">
                    <span className="font-semibold text-navy-700">
                      {p.full_name || 'Sans nom'} {self ? <span className="font-normal text-muted">(vous)</span> : null}
                    </span>
                    <span className="text-sm text-muted">{`Compte créé ${relativeTime(p.created_at)}`}</span>
                  </span>
                  {self ? (
                    <Badge tone="blue">{roleLabel[p.role]}</Badge>
                  ) : (
                    <span className="flex flex-wrap items-center gap-3">
                      <label className="sr-only" htmlFor={`role-${p.id}`}>{`Rôle de ${p.full_name}`}</label>
                      <select id={`role-${p.id}`} value={p.role} disabled={busy} onChange={(e) => void run(() => supabase().from('profiles').update({ role: e.target.value }).eq('id', p.id))} className={cn(inputClass(), 'min-h-11 w-auto')}>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {roleLabel[r.id]}
                          </option>
                        ))}
                      </select>
                      {p.active ? (
                        <button type="button" disabled={busy} onClick={() => void run(() => supabase().from('profiles').update({ active: false }).eq('id', p.id))} className="min-h-11 px-2 font-semibold text-red-700 underline underline-offset-4">
                          Suspendre l’accès
                        </button>
                      ) : (
                        <>
                          <Badge tone="red">Accès suspendu</Badge>
                          <button type="button" disabled={busy} onClick={() => void run(() => supabase().from('profiles').update({ active: true }).eq('id', p.id))} className="min-h-11 px-2 font-semibold text-blue-600 underline underline-offset-4">
                            Rétablir
                          </button>
                        </>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <AdminCard title="Inviter une personne">
        <form noValidate onSubmit={(e) => void invite(e)} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Nom complet" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} error={formError.full_name} maxLength={80} />
            <TextField label="Adresse email" type="email" inputMode="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} error={formError.email} />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-semibold">Rôle</legend>
            {roles.map((r) => (
              <label key={r.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 has-checked:border-navy-700 has-checked:bg-sky-100/40">
                <input type="radio" name="role" value={r.id} checked={form.role === r.id} onChange={() => setForm((f) => ({ ...f, role: r.id }))} className="mt-1 size-4.5 accent-navy-700" />
                <span className="flex flex-col">
                  <span className="font-semibold">{roleLabel[r.id]}</span>
                  <span className="text-sm text-muted">{r.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <button type="submit" disabled={busy} className={buttonClass('primary', 'self-start disabled:opacity-60')}>
            <UserPlus aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Créer l’invitation
          </button>
        </form>
        {sent ? (
          <div className="flex flex-col gap-3 rounded-xl border border-green-300 bg-green-100/50 p-4">
            <p className="font-semibold">Invitation créée. Envoyez ce message à la personne :</p>
            <p className="rounded-lg bg-white p-3 text-[15px] leading-6 whitespace-pre-wrap">{message}</p>
            <div className="flex flex-wrap gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={buttonClass('whatsapp')}>
                <FaWhatsapp aria-hidden="true" className="size-5" />
                Envoyer par WhatsApp
              </a>
              <button
                type="button"
                className={buttonClass('secondary')}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message);
                    setCopied(true);
                  } catch {
                    // le texte reste affiché, à sélectionner à la main
                  }
                }}
              >
                {copied ? <Check aria-hidden="true" className="size-5" /> : <Copy aria-hidden="true" className="size-5" strokeWidth={1.75} />}
                <span aria-live="polite">{copied ? 'Message copié' : 'Copier le message'}</span>
              </button>
            </div>
          </div>
        ) : null}
      </AdminCard>

      <AdminCard title="Invitations en attente">
        {invitations.length === 0 ? (
          <p className="text-muted">Aucune invitation en attente.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex flex-1 flex-col">
                  <span className="font-semibold">{inv.full_name || inv.email}</span>
                  <span className="text-sm text-muted">{`${inv.email} · ${roleLabel[inv.role]} · invitée ${relativeTime(inv.created_at)}`}</span>
                </span>
                <button type="button" disabled={busy} onClick={() => void run(() => supabase().from('invitations').delete().eq('id', inv.id))} className="inline-flex min-h-11 items-center gap-2 px-2 font-semibold text-red-700 underline underline-offset-4">
                  <Trash2 aria-hidden="true" className="size-4.5" />
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard title="Ménage du stockage">
        <p className="text-[15px] leading-6 text-muted">
          Les photos et PDF remplacés ou retirés restent dans le stockage (1 Go dans l’offre gratuite). Cette recherche liste ceux qui ne servent plus
          nulle part, même dans un contenu archivé, et qui ont plus de 24 heures.
        </p>
        {orphans === null ? (
          <button type="button" onClick={() => void findOrphans()} className={buttonClass('secondary', 'self-start')}>
            <HardDrive aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Chercher les fichiers inutilisés
          </button>
        ) : orphans.length === 0 ? (
          <AdminAlert tone="success">Aucun fichier inutilisé.</AdminAlert>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-semibold">{`${orphans.length} fichier${orphans.length > 1 ? 's' : ''} inutilisé${orphans.length > 1 ? 's' : ''}, ${megabytes(orphans.reduce((s, o) => s + o.bytes, 0))} au total.`}</p>
            <ul className="max-h-48 overflow-y-auto rounded-lg bg-surface-alt p-3 font-mono text-xs leading-5">
              {orphans.map((o) => (
                <li key={o.name}>{o.name.split('/').slice(1).join('/')}</li>
              ))}
            </ul>
            <button type="button" disabled={busy} onClick={() => void removeOrphans()} className={buttonClass('primary', 'self-start bg-red-700 hover:bg-red-700/90 disabled:opacity-60')}>
              <Trash2 aria-hidden="true" className="size-5" />
              Supprimer définitivement ces fichiers
            </button>
          </div>
        )}
        {cleanMessage ? <AdminAlert tone="success">{cleanMessage}</AdminAlert> : null}
      </AdminCard>
    </div>
  );
}

export function AccountsPage() {
  return (
    <AdminShell>
      <Accounts />
    </AdminShell>
  );
}
