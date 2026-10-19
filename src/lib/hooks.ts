'use client';

import { useSyncExternalStore } from 'react';
import { site } from '@content/site';

const subscribe = () => () => {};

function localToday(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * La date du jour chez le visiteur, au format 'AAAA-MM-JJ'.
 * Le site est construit à l'avance : `buildDate` (le jour de la construction) sert au premier affichage,
 * puis la vraie date du visiteur prend le relais. Les « prochaines dates » restent donc justes
 * même si le site n'a pas été reconstruit depuis des semaines.
 */
export function useToday(buildDate: string): string {
  return useSyncExternalStore(subscribe, localToday, () => buildDate);
}

/** L'adresse du site telle que le visiteur la voit (utile tant que le nom de domaine définitif n'existe pas). */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => site.url.replace(/\/$/, ''),
  );
}

/** Le téléphone propose-t-il sa propre fenêtre de partage ? Toujours `false` au premier affichage. */
export function useCanShare(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => typeof navigator.share === 'function',
    () => false,
  );
}
