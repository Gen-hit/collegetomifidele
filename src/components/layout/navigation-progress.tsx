'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'loading' | 'done';

/**
 * Barre de progression bleue en haut de l'écran pendant le passage d'une page à l'autre.
 * Sur une connexion lente, elle montre tout de suite que le toucher a été pris en compte.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');

  // La nouvelle page est affichée : la barre se termine.
  useEffect(() => {
    setPhase((current) => (current === 'loading' ? 'done' : current));
  }, [pathname]);

  // Une fois terminée, la barre disparaît. Si la page n'arrive jamais (lien vers un fichier), elle s'efface aussi.
  useEffect(() => {
    if (phase === 'idle') return;
    const timer = setTimeout(() => setPhase('idle'), phase === 'done' ? 400 : 12000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Un clic sur un lien du site vers une autre page lance la barre.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      setPhase('loading');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed top-0 left-0 z-60 h-[3px] rounded-r-full bg-blue-500 shadow-[0_0_8px_var(--color-sky-400)] print:hidden',
        phase === 'idle' && 'w-0 opacity-0',
        // Avance vite au début, puis de plus en plus lentement, sans jamais atteindre le bout avant l'arrivée de la page.
        phase === 'loading' && 'w-[88%] opacity-100 transition-[width] duration-8000 ease-[cubic-bezier(0.05,0.8,0.1,1)]',
        phase === 'done' && 'w-full opacity-0 transition-[width,opacity] duration-300',
      )}
    />
  );
}
