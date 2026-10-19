import teamData from './data/team.json';

/**
 * Les personnes présentées sur le site.
 *
 * `name: null` et `photo: null` affichent un emplacement « à fournir ».
 * Le portrait se dépose dans `public/photos/equipe/` (format carré pour l'équipe, 3:4 pour le Principal).
 * La fonction s'écrit dans les deux langues ; un texte entre crochets reste un emplacement.
 *
 * D'OÙ VIENNENT LES DONNÉES : content/data/team.json, réécrit par l'administration (Réglages > Équipe de direction).
 */
export type Person = {
  name: string | null;
  role: { fr: string; en: string };
  photo: string | null;
};

/** Le chef d'établissement : utilisé sur l'accueil, la page « Le collège » et « Mot du Principal ». */
export const principal: Person = {
  name: teamData.principal.name,
  role: { fr: 'Principal du collège', en: 'Principal' },
  photo: teamData.principal.photo,
};

/** L'équipe de direction, dans l'ordre d'affichage. Ajouter ou retirer une ligne suffit. */
export const leadership: Person[] = [principal, ...(teamData.others as Person[])];
