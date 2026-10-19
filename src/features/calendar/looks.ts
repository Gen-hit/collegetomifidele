import type { Tone } from '@/lib/tones';

/**
 * L'apparence d'une date selon sa famille (voir `categoryTone` dans dates.ts), identique dans l'agenda
 * et dans la vue « Année ». Les quatre familles ne se distinguent pas par la seule couleur :
 * fond plein sombre, fond plein clair, fond pâle cerclé, fond pâle sans cercle.
 */
export const dateLook: Record<Tone, string> = {
  /** Congés et jours fériés. */
  gold: 'bg-gold-400 text-ink',
  /** Évaluations et examens. */
  navy: 'bg-navy-700 text-white',
  /** Rentrées, trimestres et réunions. */
  blue: 'bg-sky-100 text-blue-600 ring-[1.5px] ring-blue-500 ring-inset',
  /** Journées internationales, fêtes et portes ouvertes. */
  green: 'bg-green-100 text-green-800',
};
