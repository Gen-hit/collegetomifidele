'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { frenchError, supabase } from '@/admin/client';
import { useAdminSession } from '@/admin/session';
import { AdminAlert, AdminFrame, AdminMessage, Spinner } from '@/admin/ui';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/field';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'activate' | 'forgot';

const titles: Record<Mode, { title: string; intro: string; submit: string }> = {
  login: { title: 'Connexion', intro: 'Accès réservé à l’équipe du collège.', submit: 'Se connecter' },
  activate: {
    title: 'Activer mon compte',
    intro: 'Vous avez reçu une invitation ? Choisissez votre mot de passe, puis confirmez votre adresse depuis le message reçu.',
    submit: 'Activer mon compte',
  },
  forgot: { title: 'Mot de passe oublié', intro: 'Indiquez votre adresse : vous recevrez un lien pour choisir un nouveau mot de passe.', submit: 'Recevoir le lien' },
};

export default function LoginPage() {
  const session = useAdminSession();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (session.status === 'ready') router.replace('/admin/');
  }, [session.status, router]);

  if (session.status === 'unconfigured') return <AdminMessage kind="unconfigured" />;
  if (session.status === 'no-access') return <AdminMessage kind="no-access" email={session.email} onSignOut={session.signOut} />;
  if (session.status === 'loading' || session.status === 'ready') {
    return (
      <AdminFrame>
        <Spinner label="Chargement" />
      </AdminFrame>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (mode !== 'forgot' && password.length < 8) {
      setMessage({ tone: 'error', text: 'Le mot de passe doit compter au moins 8 caractères.' });
      return;
    }
    setBusy(true);
    const auth = supabase().auth;
    const origin = window.location.origin;
    try {
      if (mode === 'login') {
        const { error } = await auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        // La session déclenche le chargement du profil, puis le renvoi vers le tableau de bord.
      } else if (mode === 'activate') {
        const { data, error } = await auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${origin}/admin/connexion/` },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage({
            tone: 'success',
            text: 'Compte créé. Ouvrez le message envoyé à votre adresse et suivez le lien pour le confirmer, puis connectez-vous.',
          });
          setMode('login');
        }
      } else {
        const { error } = await auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/admin/mot-de-passe/` });
        if (error) throw error;
        setMessage({ tone: 'success', text: 'Si cette adresse a un compte, un lien vient de lui être envoyé. Pensez à regarder les courriers indésirables.' });
      }
    } catch (error) {
      setMessage({ tone: 'error', text: frenchError(error) });
    } finally {
      setBusy(false);
    }
  }

  const copy = titles[mode];
  const switchTo = (next: Mode) => {
    setMode(next);
    setMessage(null);
  };

  return (
    <AdminFrame>
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-navy-700">{copy.title}</h1>
          <p className="text-[15px] leading-6 text-muted">{copy.intro}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-semibold">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass()}
          />
        </div>

        {mode !== 'forgot' ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-semibold">
              {mode === 'activate' ? 'Choisissez un mot de passe' : 'Mot de passe'}
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'activate' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby={mode === 'activate' ? 'password-hint' : undefined}
              className={inputClass()}
            />
            {mode === 'activate' ? (
              <p id="password-hint" className="text-sm text-muted">
                Au moins 8 caractères. Évitez un mot de passe déjà utilisé ailleurs.
              </p>
            ) : null}
          </div>
        ) : null}

        {message ? <AdminAlert tone={message.tone}>{message.text}</AdminAlert> : null}

        <button type="submit" disabled={busy || !email} className={buttonClass('primary', 'w-full disabled:opacity-60')}>
          {busy ? 'Un instant…' : copy.submit}
        </button>

        <div className="flex flex-col gap-1 border-t border-line pt-4 text-[15px]">
          {mode !== 'login' ? (
            <button type="button" onClick={() => switchTo('login')} className={linkClass}>
              J’ai déjà un compte : me connecter
            </button>
          ) : null}
          {mode !== 'forgot' ? (
            <button type="button" onClick={() => switchTo('forgot')} className={linkClass}>
              Mot de passe oublié ?
            </button>
          ) : null}
          {mode !== 'activate' ? (
            <button type="button" onClick={() => switchTo('activate')} className={linkClass}>
              J’ai reçu une invitation : activer mon compte
            </button>
          ) : null}
        </div>
      </form>
    </AdminFrame>
  );
}

const linkClass = cn('min-h-11 self-start text-left font-semibold text-blue-600 underline-offset-4 hover:underline');
