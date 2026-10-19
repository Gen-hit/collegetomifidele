'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { frenchError, supabase } from '@/admin/client';
import { useAdminSession } from '@/admin/session';
import { AdminAlert, AdminFrame, AdminMessage, Spinner } from '@/admin/ui';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/field';

/** Arrivée depuis le lien « Mot de passe oublié » reçu par email : choix d'un nouveau mot de passe. */
export default function NewPasswordPage() {
  const session = useAdminSession();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session.status === 'unconfigured') return <AdminMessage kind="unconfigured" />;
  if (session.status === 'loading') {
    return (
      <AdminFrame>
        <Spinner label="Vérification du lien" />
      </AdminFrame>
    );
  }
  if (session.status === 'signed-out') {
    return (
      <AdminFrame>
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold text-navy-700">Lien expiré</h1>
          <p>Ce lien n’est plus valable. Demandez-en un nouveau depuis la page de connexion, rubrique « Mot de passe oublié ».</p>
          <a href="/admin/connexion/" className={buttonClass('primary', 'self-start')}>
            Revenir à la connexion
          </a>
        </div>
      </AdminFrame>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Le mot de passe doit compter au moins 8 caractères.');
    if (password !== confirm) return setError('Les deux mots de passe ne sont pas identiques.');
    setBusy(true);
    const { error: updateError } = await supabase().auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(frenchError(updateError));
    router.replace('/admin/');
  }

  return (
    <AdminFrame>
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <h1 className="font-display text-2xl font-bold text-navy-700">Nouveau mot de passe</h1>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-semibold">
            Nouveau mot de passe
          </label>
          <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass()} />
          <p className="text-sm text-muted">Au moins 8 caractères.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm" className="font-semibold">
            Le même, une seconde fois
          </label>
          <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass()} />
        </div>
        {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
        <button type="submit" disabled={busy} className={buttonClass('primary', 'w-full disabled:opacity-60')}>
          {busy ? 'Enregistrement…' : 'Enregistrer et continuer'}
        </button>
      </form>
    </AdminFrame>
  );
}
