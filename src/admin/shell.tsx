'use client';

import {
  CalendarDays,
  ExternalLink,
  History,
  FileText,
  Images,
  Inbox,
  ListChecks,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { site } from '@content/site';
import { cn } from '@/lib/utils';
import { supabase } from './client';
import { roleLabel } from './labels';
import { useAdminSession, type Role } from './session';
import { AdminMessage, Spinner } from './ui';

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Rôles qui voient l'entrée ; tous par défaut. */
  roles?: Role[];
  /** Écran prévu dans un lot suivant : affiché, pas encore cliquable. */
  soon?: string;
  /** Pastille : contenus à valider, ou demandes des familles non traitées. */
  counter?: 'review' | 'requests';
};

export const adminNav: NavItem[] = [
  { href: '/admin/', label: 'Tableau de bord', Icon: LayoutDashboard },
  { href: '/admin/a-valider/', label: 'À valider', Icon: ListChecks, counter: 'review' },
  { href: '/admin/actualites/', label: 'Actualités', Icon: Newspaper },
  { href: '/admin/calendrier/', label: 'Calendrier', Icon: CalendarDays },
  { href: '/admin/galerie/', label: 'Galerie', Icon: Images },
  { href: '/admin/documents/', label: 'Documents', Icon: FileText },
  { href: '/admin/demandes/', label: 'Demandes des familles', Icon: Inbox, counter: 'requests' },
  { href: '/admin/reglages/', label: 'Réglages', Icon: Settings, roles: ['super_admin', 'principal'] },
  { href: '/admin/journal/', label: 'Journal', Icon: History, roles: ['super_admin', 'principal'] },
  { href: '/admin/comptes/', label: 'Comptes', Icon: Users, roles: ['super_admin'] },
];

type Counters = { review: number; requests: number };

function NavLinks({ role, onNavigate, counters }: { role: Role; onNavigate?: () => void; counters: Counters }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {adminNav
        .filter((item) => !item.roles || item.roles.includes(role))
        .map(({ href, label, Icon, soon, counter }) => {
          const current = pathname === href || pathname === href.replace(/\/$/, '') || (href !== '/admin/' && pathname.startsWith(href));
          const inner = (
            <>
              <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{label}</span>
              {counter && counters[counter] > 0 ? (
                <span className="flex min-w-6 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs leading-5 font-bold text-ink">
                  {counters[counter]}
                </span>
              ) : null}
              {soon ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] leading-4 font-semibold tracking-wide text-sky-200 uppercase">
                  Bientôt
                </span>
              ) : null}
            </>
          );
          const classes = cn(
            'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] leading-5 font-semibold transition-colors',
            current ? 'bg-white text-navy-700' : 'text-white/85 hover:bg-white/10 hover:text-white',
            soon && 'cursor-not-allowed opacity-60 hover:bg-transparent hover:text-white/85',
          );
          return (
            <li key={href}>
              {soon ? (
                <span className={classes} aria-disabled="true" title={`Arrive avec le lot ${soon}`}>
                  {inner}
                </span>
              ) : (
                <Link href={href} className={classes} aria-current={current ? 'page' : undefined} onClick={onNavigate}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
    </ul>
  );
}

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.logo.src} alt="" width={30} height={34} className="h-8.5 w-auto" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-display text-lg font-bold text-white">{site.name}</span>
        <span className="text-xs font-semibold tracking-[0.12em] text-gold-400 uppercase">Administration</span>
      </span>
    </span>
  );
}

/**
 * Cadre des écrans d'administration : barre latérale sur ordinateur, menu repliable sur téléphone.
 * Il n'affiche son contenu qu'à une personne connectée avec un compte actif ; sinon il renvoie vers la connexion.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [counters, setCounters] = useState<Counters>({ review: 0, requests: 0 });
  const pathname = usePathname();
  const ready = session.status === 'ready';

  // Pastilles « À valider » et « Demandes des familles », rafraîchies à chaque changement d'écran.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    const client = supabase();
    Promise.all([client.rpc('publish_status'), client.rpc('requests_status')]).then(([review, requests]) => {
      if (!active) return;
      const r = (requests.data ?? {}) as { preinscriptions?: number; messages?: number };
      setCounters({
        review: Number((review.data as { toReview?: number } | null)?.toReview) || 0,
        requests: (Number(r.preinscriptions) || 0) + (Number(r.messages) || 0),
      });
    });
    return () => {
      active = false;
    };
  }, [ready, pathname]);

  useEffect(() => {
    if (session.status === 'signed-out') router.replace('/admin/connexion/');
  }, [session.status, router]);

  if (session.status === 'unconfigured') return <AdminMessage kind="unconfigured" />;
  if (session.status === 'no-access') return <AdminMessage kind="no-access" email={session.email} onSignOut={session.signOut} />;
  if (session.status !== 'ready') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-alt">
        <Spinner label="Chargement de l’administration" />
      </div>
    );
  }

  const { me } = session;
  const footer = (
    <div className="flex flex-col gap-3 border-t border-white/15 pt-4">
      <div className="flex flex-col">
        <span className="font-semibold text-white">{me.full_name || 'Compte sans nom'}</span>
        <span className="text-sm text-sky-200">{roleLabel[me.role]}</span>
      </div>
      <a
        href="/fr/"
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-white/85 hover:text-white"
      >
        <ExternalLink aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
        Voir le site
      </a>
      <button
        type="button"
        onClick={() => void session.signOut()}
        className="inline-flex min-h-11 items-center gap-2 text-left text-[15px] font-semibold text-white/85 hover:text-white"
      >
        <LogOut aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
        Se déconnecter
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface-alt lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Ordinateur : barre latérale */}
      <aside className="on-dark sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto bg-indigo-900 p-5 lg:flex">
        <Brand />
        <nav aria-label="Administration" className="flex-1">
          <NavLinks role={me.role} counters={counters} />
        </nav>
        {footer}
      </aside>

      {/* Téléphone : bandeau et menu repliable */}
      <header className="on-dark sticky top-0 z-30 flex items-center justify-between gap-3 bg-indigo-900 px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="admin-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-11 items-center justify-center rounded-xl border border-white/25 text-white"
        >
          {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          <span className="sr-only">{menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        </button>
      </header>
      {menuOpen ? (
        <div id="admin-menu" className="on-dark sticky top-[68px] z-20 flex flex-col gap-6 bg-indigo-900 px-4 pb-5 shadow-float lg:hidden">
          <nav aria-label="Administration">
            <NavLinks role={me.role} counters={counters} onNavigate={() => setMenuOpen(false)} />
          </nav>
          {footer}
        </div>
      ) : null}

      <main id="contenu" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
