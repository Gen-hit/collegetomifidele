import { documentById } from '@content/documents';
import { gallery } from '@content/gallery';
import { fees } from '@content/fees';
import { photo } from '@content/photos';
import { leadership } from '@content/team';
import { lowestTuition } from '@/features/fees/simulate';
import { statFor } from '@/features/results/stats';
import type { Dictionary } from '@/i18n/dictionaries';
import { showPlaceholders } from '@/lib/placeholders';

/**
 * Les sections qui n'ont encore rien à montrer sur le site public : tant que le collège n'a pas fourni leur contenu
 * (Réglages > Textes du site, Équipe, Galerie…), elles disparaissent, et avec elles leurs liens dans le menu et dans
 * le sommaire de la page. Une seule liste, pour que menu, sommaire et page restent d'accord.
 */

/** Les personnes affichées : en mode public, seulement celles dont le nom est connu. */
export const visiblePeople = <P extends { name: string | null }>(people: P[]): P[] =>
  showPlaceholders ? people : people.filter((person) => person.name);

/** Les photos de la galerie qui existent vraiment (un emplacement sans image n'est montré qu'en aperçu). */
export const visibleGallery = gallery.filter((item) => item.src || showPlaceholders);

/** Chemins avec ancre (« /about#histoire ») des sections masquées. */
export function hiddenSections(dict: Dictionary): Set<string> {
  if (showPlaceholders) return new Set();
  const p = dict.pages;
  const hidden: [string, boolean][] = [
    ['/about#histoire', !p.about.history.steps.some((step) => step.title)],
    ['/about#equipe', visiblePeople(leadership).length === 0],
    ['/campus#clubs', !p.campus.clubs.items.some((club) => club.name)],
    [
      '/campus#reglement',
      !p.campus.rules.paragraphs.some(Boolean) && !p.campus.rules.points.some(Boolean) && !documentById('reglement-interieur')?.file,
    ],
    ['/campus#galerie', visibleGallery.length === 0],
    // La page Galerie reste en ligne (elle annonce les photos), mais on n'y envoie personne tant qu'elle est vide.
    ['/gallery', visibleGallery.length === 0],
    ['/admissions#faq', !p.admissions.faq.items.some((item) => item.a)],
    ['/admissions/fees#simulateur', lowestTuition(fees) === null],
    ['/admissions/fees#a-savoir', !p.fees.notes.items.some(Boolean)],
    ['/programmes#resultats', !['bepc', 'baccalaureat', 'gce-ol', 'gce-al'].some((id) => statFor(id)?.latest?.rate != null)],
    ['/programmes/technique#specialites', !p.technique.specialities.items.some((item) => item.name)],
    ['/programmes/technique#ateliers', !p.technique.workshops.photos.some((_, index) => photo(`technique.workshops.${index + 1}`))],
  ];
  return new Set(hidden.filter(([, isHidden]) => isHidden).map(([path]) => path));
}

/** Le sommaire d'une page, sans les sections masquées. */
export function visibleToc<T extends { id: string }>(dict: Dictionary, page: string, items: T[]): T[] {
  const hidden = hiddenSections(dict);
  return items.filter((item) => !hidden.has(`${page}#${item.id}`));
}

/** Vrai si la section `page#id` est affichée. */
export const isShown = (dict: Dictionary, path: string) => !hiddenSections(dict).has(path);

/** Où mène un lien vers une section masquée : une section voisine qui reste affichée, sinon nulle part. */
const fallbacks: Record<string, string> = { '/about#histoire': '/about#valeurs' };

/** Le chemin à utiliser pour un lien vers `path`, ou `null` s'il faut retirer le lien. */
export function sectionPath(hidden: Set<string>, path: string): string | null {
  if (!hidden.has(path)) return path;
  return fallbacks[path] ?? null;
}
