import documentsData from './data/documents.json';
import { fees } from './fees';

/**
 * Les documents à télécharger : la page « Documents » lit ce fichier.
 *
 * METTRE UN DOCUMENT EN LIGNE :
 *   1. déposer le PDF dans public/documents/ (nom en minuscules, sans accent ni espace) ;
 *   2. dans content/data/documents.json, remplacer `"file": null` par son chemin, par exemple '/documents/reglement-interieur.pdf' ;
 *   3. indiquer la date de mise à jour dans `updated`, au format 'AAAA-MM-JJ'.
 *
 * Tant que `file` vaut `null`, le document est annoncé « Bientôt disponible ».
 * Supprimer l'entrée d'un document que le collège ne diffuse pas ; en ajouter une pour tout nouveau document.
 *
 * UN FICHIER PAR LANGUE (facultatif) : file: { fr: '/documents/x-fr.pdf', en: '/documents/x-en.pdf' }.
 *
 * APERÇU (facultatif) : `preview` liste une image par page du document, déposée dans public/documents/apercus/.
 * Le document s'ouvre alors dans la visionneuse du site, page par page, sur téléphone comme sur ordinateur.
 * Sans `preview`, le bouton « Aperçu » ouvre le PDF dans un nouvel onglet.
 *
 * Deux documents sont déjà en ligne, fabriqués à partir du site le 7 octobre 2026 :
 *   - le calendrier scolaire à imprimer : une photographie de content/calendar.ts ce jour-là, à refaire si les dates changent ;
 *   - la fiche d'inscription vierge, bilingue : un modèle à valider par la direction, ou à remplacer par la fiche du collège.
 *
 * D'OÙ VIENNENT LES DONNÉES
 *   Elles sont dans content/data/documents.json. Quand le back-office est relié (réglages NEXT_PUBLIC_SUPABASE_URL et
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY), ce fichier est réécrit à chaque construction du site avec le contenu publié dans
 *   l'administration (/admin) : on les modifie alors là-bas, pas ici. Sans back-office, on modifie
 *   directement content/data/documents.json, en gardant la forme décrite ci-dessous.
 */
/** Une valeur unique, ou une valeur par langue. */
export type Localized<T> = T | { fr: T; en: T };

export function localize<T>(value: Localized<T>, locale: 'fr' | 'en'): T {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && 'fr' in value ? (value as { fr: T; en: T })[locale] : (value as T);
}

export type DocumentCategory = 'rules' | 'admissions' | 'supplies' | 'school';

export type SchoolDocument = {
  /** Identifiant unique, sans espace ni accent. */
  id: string;
  category: DocumentCategory;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  file: Localized<string> | null;
  /** Une image par page, pour l'aperçu dans la visionneuse. */
  preview?: Localized<string[]>;
  updated: string | null;
};

/** L'ordre des rubriques sur la page. Les libellés sont dans messages/<langue>/documents.json. */
export const documentCategories: DocumentCategory[] = ['rules', 'admissions', 'supplies', 'school'];

/** La grille des frais garde un seul fichier, renseigné avec les frais (content/fees.ts, `gridPdf`). */
type StoredDocument = SchoolDocument & { usesFeeGrid?: boolean };

export const documents: SchoolDocument[] = (documentsData as StoredDocument[]).map(({ usesFeeGrid, ...doc }) =>
  usesFeeGrid ? { ...doc, file: fees.gridPdf } : doc,
);

/** Retrouve un document par son identifiant (le règlement intérieur sur la page « Vie scolaire », par exemple). */
export function documentById(id: string): SchoolDocument | undefined {
  return documents.find((doc) => doc.id === id);
}
