'use client';

import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { backOfficeConfigured, supabase } from './client';

export type Role = 'super_admin' | 'principal' | 'secretariat';

/** Ce que la base dit de la personne connectée (fonction whoami). */
export type Me = {
  id: string;
  full_name: string;
  role: Role;
  school: { id: string; slug: string; name: string };
  can_publish: boolean;
  secretariat_can_publish: boolean;
};

type State =
  | { status: 'unconfigured' }
  | { status: 'loading' }
  | { status: 'signed-out' }
  /** Connecté, mais sans compte actif dans l'établissement (compte désactivé). */
  | { status: 'no-access'; email: string }
  | { status: 'ready'; session: Session; me: Me };

type AdminSession = State & { signOut: () => Promise<void>; refresh: () => Promise<void> };

const Context = createContext<AdminSession | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(backOfficeConfigured ? { status: 'loading' } : { status: 'unconfigured' });

  const load = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({ status: 'signed-out' });
      return;
    }
    const { data, error } = await supabase().rpc('whoami');
    if (error || !data) {
      setState({ status: 'no-access', email: session.user.email ?? '' });
      return;
    }
    setState({ status: 'ready', session, me: data as Me });
  }, []);

  useEffect(() => {
    if (!backOfficeConfigured) return;
    const client = supabase();
    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (active) void load(data.session);
    });
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      // Le renouvellement silencieux du jeton ne change pas le profil : inutile de tout recharger.
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;
      void load(session);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [load]);

  const value = useMemo<AdminSession>(
    () => ({
      ...state,
      signOut: async () => {
        await supabase().auth.signOut();
        setState({ status: 'signed-out' });
      },
      refresh: async () => {
        const { data } = await supabase().auth.getSession();
        await load(data.session);
      },
    }),
    [state, load],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAdminSession(): AdminSession {
  const value = useContext(Context);
  if (!value) throw new Error('useAdminSession doit être utilisé dans AdminSessionProvider.');
  return value;
}

/** La personne connectée ; à utiliser seulement sous <AdminShell>, qui garantit l'état « ready ». */
export function useMe(): Me {
  const session = useAdminSession();
  if (session.status !== 'ready') throw new Error('Aucune personne connectée.');
  return session.me;
}
