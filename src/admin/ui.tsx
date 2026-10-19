'use client';

import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { site } from '@content/site';
import { buttonClass } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Spinner({ label, className }: { label: string; className?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-3 text-muted', className)}>
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-blue-500" strokeWidth={2} />
      <span>{label}…</span>
    </span>
  );
}

const alertLooks = {
  info: { box: 'border-sky-200 bg-sky-100', icon: 'text-blue-500', Icon: Info },
  success: { box: 'border-green-300 bg-green-100', icon: 'text-green-700', Icon: CircleCheck },
  warning: { box: 'border-gold-300 bg-gold-100', icon: 'text-gold-700', Icon: TriangleAlert },
  error: { box: 'border-red-700/30 bg-red-100', icon: 'text-red-700', Icon: CircleAlert },
} as const;

/** Message d'état. `role` : « alert » pour une erreur ou un résultat attendu, « status » sinon. */
export function AdminAlert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: keyof typeof alertLooks;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, icon, Icon } = alertLooks[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-2xl border p-4 text-[15px] leading-6', box, className)}>
      <Icon aria-hidden="true" className={cn('mt-0.5 size-5 shrink-0', icon)} strokeWidth={1.75} />
      <div className="flex flex-col gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}

export function AdminCard({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6', className)}>
      {title || action ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {title ? <h2 className="font-display text-xl leading-7 font-bold text-navy-700">{title}</h2> : null}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const badgeLooks = {
  neutral: 'bg-surface-alt text-muted',
  blue: 'bg-sky-100 text-blue-600',
  green: 'bg-green-100 text-green-800',
  gold: 'bg-gold-100 text-gold-700',
  red: 'bg-red-100 text-red-700',
} as const;

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof badgeLooks; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] leading-5 font-semibold', badgeLooks[tone])}>{children}</span>
  );
}

export function PageTitle({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      {eyebrow ? <p className="text-[13px] leading-4 font-semibold tracking-[0.08em] text-blue-600 uppercase">{eyebrow}</p> : null}
      <h1 className="font-display text-3xl leading-tight font-bold text-navy-700 sm:text-4xl">{title}</h1>
      {intro ? <p className="max-w-2xl text-muted">{intro}</p> : null}
    </header>
  );
}

/** Écran d'accueil hors administration : connexion, message de configuration ou d'accès refusé. */
export function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-surface-alt px-4 py-10">
      <a href="/fr/" className="flex items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logo.src} alt="" width={36} height={41} className="h-10 w-auto" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-xl font-bold text-navy-700">{site.name}</span>
          <span className="text-xs font-semibold tracking-[0.12em] text-gold-700 uppercase">Administration du site</span>
        </span>
      </a>
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">{children}</div>
    </div>
  );
}

export function AdminMessage({ kind, email, onSignOut }: { kind: 'unconfigured' | 'no-access'; email?: string; onSignOut?: () => void }) {
  return (
    <AdminFrame>
      {kind === 'unconfigured' ? (
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold text-navy-700">Administration non reliée</h1>
          <p>
            Le site n’est pas encore relié à sa base de données. Renseignez <code>NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans <code>.env.local</code> (en local) ou dans les réglages de
            l’hébergeur, puis relancez le site.
          </p>
          <p className="text-muted">La marche à suivre est dans le README du projet, rubrique « Back-office ».</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold text-navy-700">Accès non autorisé</h1>
          <p>
            Le compte <strong>{email}</strong> n’a pas, ou plus, accès à l’administration. Si c’est une erreur, contactez
            l’administrateur du site.
          </p>
          <button type="button" onClick={onSignOut} className={buttonClass('secondary', 'self-start')}>
            Se déconnecter
          </button>
        </div>
      )}
    </AdminFrame>
  );
}
