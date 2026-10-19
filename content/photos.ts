import photosData from './data/photos.json';

/**
 * Toutes les photos du site, au même endroit.
 *
 * Pour afficher une vraie photo à la place d'un emplacement :
 *   1. déposer le fichier dans `public/photos/` (format WebP, 1 600 px de large au maximum) ;
 *   2. remplacer `null` par son chemin, par exemple '/photos/campus.webp'.
 *
 * Tant qu'une valeur vaut `null`, le site affiche un emplacement qui décrit la photo attendue.
 * D'OÙ VIENNENT LES DONNÉES : les chemins déposés depuis l'administration (Réglages > Photos du site) sont dans
 * content/data/photos.json ; ils remplacent les valeurs ci-dessous. La liste des emplacements reste ici.
 *
 * Les portraits (Principal, équipe de direction) se renseignent dans `content/team.ts`,
 * les photos de la galerie dans `content/gallery.ts` et les couvertures d'articles dans `content/news.ts`.
 */
const slots: Record<string, string | null> = {
  // Accueil
  'home.hero': null,
  'home.programmes.francophone': null,
  'home.programmes.anglophone': null,
  'home.programmes.technique': null,
  'home.facilities.1': null,
  'home.facilities.2': null,
  'home.facilities.3': null,
  'home.facilities.4': null,

  // Le collège
  'about.campus': null,

  // Programmes
  'programmes.francophone': null,
  'programmes.anglophone': null,
  'programmes.technique': null,

  // Section francophone
  'francophone.overview': null,
  'francophone.gallery.1': null,
  'francophone.gallery.2': null,
  'francophone.gallery.3': null,

  // Anglophone section
  'anglophone.overview': null,
  'anglophone.gallery.1': null,
  'anglophone.gallery.2': null,
  'anglophone.gallery.3': null,

  // Enseignement technique
  'technique.overview': null,
  'technique.workshops.1': null,
  'technique.workshops.2': null,
  'technique.workshops.3': null,

  // Infrastructures : une photo par espace, dans l'ordre de messages/<langue>/facilities.json
  'facilities.labs': null,
  'facilities.computers': null,
  'facilities.workshops': null,
  'facilities.library': null,
  'facilities.sports': null,
  'facilities.other': null,

  // Vie scolaire : une photo par club, dans l'ordre de messages/<langue>/campus.json, puis la tenue de classe
  'campus.clubs.1': null,
  'campus.clubs.2': null,
  'campus.clubs.3': null,
  'campus.clubs.4': null,
  'campus.clubs.5': null,
  'campus.clubs.6': null,
  'campus.uniform': null,
};

const saved = photosData.slots as Record<string, string | null>;
for (const key of Object.keys(slots)) if (saved[key]) slots[key] = saved[key];

/** Les emplacements, pour l'administration et les contrôles. */
export const photoSlots = Object.keys(slots);

/** Renvoie le chemin d'une photo, ou `undefined` si elle n'est pas encore fournie. */
export function photo(key: string): string | undefined {
  if (!(key in slots)) {
    throw new Error(`Photo inconnue : « ${key} ». Ajoutez cette clé dans content/photos.ts.`);
  }
  return slots[key] ?? undefined;
}
