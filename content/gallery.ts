import galleryData from './data/gallery.json';

/**
 * La galerie photo : la page « Galerie » et l'aperçu de la page « Vie scolaire » lisent ce fichier.
 *
 * AJOUTER UNE PHOTO :
 *   1. déposer l'image dans public/photos/galerie/ (format WebP, 1 600 px de large au maximum) ;
 *   2. ajouter une ligne dans content/data/gallery.json, ou remplacer le `null` d'un emplacement par le chemin de l'image.
 *
 * `thumb` est facultatif : une version réduite (600 px de large) affichée dans la grille, pour que la page
 * reste légère sur une connexion lente. Sans `thumb`, la grille affiche l'image complète.
 * Tant que `src` vaut `null`, la grille affiche un emplacement qui décrit la photo attendue.
 *
 * Chaque photo s'ouvre dans la visionneuse, avec sa légende et, si elle existe, sa description :
 *   { src: '/photos/galerie/prix.webp', category: 'events', caption: { fr: 'Remise des prix', en: 'Prize-giving' },
 *     description: { fr: 'Les lauréats de la classe de 3e, le 11 juin.', en: 'The 3e prize winners, 11 June.' } }
 *
 * D'OÙ VIENNENT LES DONNÉES
 *   Elles sont dans content/data/gallery.json. Quand le back-office est relié (réglages NEXT_PUBLIC_SUPABASE_URL et
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY), ce fichier est réécrit à chaque construction du site avec le contenu publié dans
 *   l'administration (/admin) : on les modifie alors là-bas, pas ici. Sans back-office, on modifie
 *   directement content/data/gallery.json, en gardant la forme décrite ci-dessous.
 */
export type GalleryCategory = 'campus' | 'classes' | 'workshops' | 'sport' | 'events';

export type GalleryPhoto = {
  src: string | null;
  thumb?: string;
  category: GalleryCategory;
  /** Ce que montre la photo : légende et texte alternatif. */
  caption: { fr: string; en: string };
  /** Facultatif : une ou deux phrases affichées sous la photo agrandie (date, lieu, classes concernées). */
  description?: { fr: string; en: string };
  /** Dimensions de l'image, renseignées par le back-office. */
  width?: number;
  height?: number;
};

/** L'ordre des thèmes dans les filtres. Les libellés sont dans messages/<langue>/gallery.json. */
export const galleryCategories: GalleryCategory[] = ['campus', 'classes', 'workshops', 'sport', 'events'];

export const gallery = galleryData as GalleryPhoto[];
