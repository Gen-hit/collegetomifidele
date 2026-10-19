import calendarFr from '@messages/fr/calendar.json';
import documentsFr from '@messages/fr/documents.json';
import galleryFr from '@messages/fr/gallery.json';
import newsFr from '@messages/fr/news.json';
import { calendarCategories } from '@content/calendar';
import { documentCategories } from '@content/documents';
import { galleryCategories } from '@content/gallery';
import { newsCategories } from '@content/news';
import type { ContentConfig, ContentTable, FieldOption } from './types';

/**
 * Les quatre contenus du site dans l'administration : leurs champs, leur liste et leur adresse sur le site.
 * Les libellés des catégories viennent des textes du site (messages/fr/*.json) : un seul endroit à modifier.
 */

const options = <K extends string>(keys: readonly K[], labels: Record<K, string>): FieldOption[] =>
  keys.map((value) => ({ value, label: labels[value] }));

export const newsCategoryOptions = options(newsCategories, newsFr.categories);
export const calendarCategoryOptions = options(calendarCategories, calendarFr.categories);
export const galleryCategoryOptions = options(galleryCategories, galleryFr.categories);
export const documentCategoryOptions = options(documentCategories, documentsFr.categories);

const labelOf = (list: FieldOption[], value: unknown) => list.find((o) => o.value === value)?.label ?? String(value ?? '');

/** « 7 sept. 2026 ». Les dates de la base sont des jours, sans heure. */
export function shortDate(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return '';
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d));
}

export function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Douala' }).format(new Date());
}

export const newsConfig: ContentConfig = {
  table: 'news',
  path: '/admin/actualites/',
  title: 'Actualités',
  one: 'l’actualité',
  newLabel: 'Nouvelle actualité',
  folder: 'actualites',
  emptyText: 'Aucune actualité dans cette liste.',
  fields: [
    { name: 'title', label: 'Titre', kind: 'text', bilingual: true, required: true, maxLength: 120, hint: 'Deux lignes au maximum sur la carte : allez à l’essentiel.' },
    { name: 'summary', label: 'Résumé', kind: 'textarea', bilingual: true, required: true, rows: 3, maxLength: 280, hint: 'Une ou deux phrases pour le parent pressé : elles apparaissent sur la carte et en tête de l’article.' },
    { name: 'category', label: 'Rubrique', kind: 'select', options: newsCategoryOptions, required: true, half: true },
    { name: 'date', label: 'Date de publication', kind: 'date', required: true, half: true },
    { name: 'cover', label: 'Photo de couverture', kind: 'image', hint: 'Format paysage de préférence. Elle est réduite automatiquement avant l’envoi.' },
    { name: 'cover_caption', label: 'Ce que montre la photo', kind: 'text', bilingual: true, maxLength: 140, hint: 'Sert de légende et de description pour les malvoyants.' },
    { name: 'body', label: 'Texte de l’article', kind: 'markdown', bilingual: true, required: true, rows: 14 },
    { name: 'featured', label: 'Mettre « À la une »', kind: 'checkbox', hint: 'Une seule actualité à la une ; sinon la plus récente est choisie.' },
    { name: 'slug', label: 'Adresse de la page', kind: 'slug', slugFrom: 'title', hint: 'Fabriquée à partir du titre. Elle ne change plus une fois l’article publié, pour ne pas casser les liens partagés.' },
  ],
  defaults: () => ({ category: 'life', date: today(), featured: false, is_sample: false, cover: null }),
  order: [
    { column: 'date', ascending: false, nullsFirst: false },
    { column: 'created_at', ascending: false },
  ],
  titleOf: (row) => String(row.title_fr ?? ''),
  subtitleOf: (row) => [shortDate(row.date) || 'Sans date', labelOf(newsCategoryOptions, row.category)].join(' · '),
  thumbOf: (row) => (row.cover as string | null) ?? null,
  sitePath: (row) => `/fr/news/${row.slug}/`,
  categoryField: 'category',
};

export const calendarConfig: ContentConfig = {
  table: 'calendar_events',
  path: '/admin/calendrier/',
  title: 'Calendrier',
  one: 'la date',
  newLabel: 'Nouvelle date',
  folder: 'calendrier',
  emptyText: 'Aucune date dans cette liste.',
  fields: [
    { name: 'title', label: 'Intitulé', kind: 'text', bilingual: true, required: true, maxLength: 120 },
    { name: 'category', label: 'Catégorie', kind: 'select', options: calendarCategoryOptions, required: true },
    { name: 'start_date', label: 'Premier jour', kind: 'date', half: true, hint: 'Vide : la date apparaît dans « Dates à confirmer ».' },
    { name: 'end_date', label: 'Dernier jour (facultatif)', kind: 'date', half: true, hint: 'Pour un événement de plusieurs jours.' },
    { name: 'confirm', label: 'Afficher la mention « À confirmer »', kind: 'checkbox', hint: 'Pour une date provisoire.' },
    { name: 'note', label: 'Précision (facultatif)', kind: 'textarea', bilingual: true, rows: 2, maxLength: 240, hint: 'Horaire, lieu, classes concernées.' },
    { name: 'key', label: 'Identifiant du lien', kind: 'slug', slugFrom: 'title', hint: 'Sert au lien de partage de la date. Il ne change plus une fois la date publiée.' },
  ],
  defaults: () => ({ category: 'meeting', confirm: false, start_date: null, end_date: null }),
  order: [
    { column: 'start_date', ascending: true, nullsFirst: false },
    { column: 'created_at', ascending: true },
  ],
  titleOf: (row) => String(row.title_fr ?? ''),
  subtitleOf: (row) => {
    const start = shortDate(row.start_date);
    const end = shortDate(row.end_date);
    const when = start ? (end ? `${start} → ${end}` : start) : 'Date à confirmer';
    return [when, labelOf(calendarCategoryOptions, row.category)].join(' · ');
  },
  sitePath: (row) => `/fr/calendar/#evt-${row.key}`,
  validate: (row) => {
    const errors: Record<string, string> = {};
    if (row.end_date && !row.start_date) errors.start_date = 'Indiquez le premier jour.';
    if (row.end_date && row.start_date && String(row.end_date) < String(row.start_date)) errors.end_date = 'Le dernier jour précède le premier.';
    return errors;
  },
  categoryField: 'category',
};

export const galleryConfig: ContentConfig = {
  table: 'gallery_photos',
  path: '/admin/galerie/',
  title: 'Galerie',
  one: 'la photo',
  newLabel: 'Ajouter une photo',
  folder: 'galerie',
  emptyText: 'Aucune photo dans cette liste.',
  fields: [
    { name: 'src', label: 'Photo', kind: 'image', thumbColumn: 'thumb', sizeColumns: true, hint: 'Réduite automatiquement avant l’envoi. Sans photo, le site affiche un emplacement.' },
    { name: 'caption', label: 'Légende', kind: 'text', bilingual: true, required: true, maxLength: 120, hint: 'Ce que montre la photo : elle sert aussi aux malvoyants.' },
    { name: 'category', label: 'Thème', kind: 'select', options: galleryCategoryOptions, required: true },
    { name: 'description', label: 'Description (facultatif)', kind: 'textarea', bilingual: true, rows: 2, maxLength: 240, hint: 'Une ou deux phrases sous la photo agrandie : date, lieu, classes.' },
  ],
  defaults: () => ({ category: 'events', src: null, thumb: null, position: 0 }),
  order: [
    { column: 'position', ascending: true },
    { column: 'created_at', ascending: true },
  ],
  titleOf: (row) => String(row.caption_fr ?? ''),
  subtitleOf: (row) => labelOf(galleryCategoryOptions, row.category),
  thumbOf: (row) => (row.thumb as string | null) ?? (row.src as string | null) ?? null,
  sitePath: () => '/fr/gallery/',
  positionColumn: 'position',
  categoryField: 'category',
};

export const documentsConfig: ContentConfig = {
  table: 'documents',
  path: '/admin/documents/',
  title: 'Documents',
  one: 'le document',
  newLabel: 'Nouveau document',
  folder: 'documents',
  emptyText: 'Aucun document dans cette liste.',
  fields: [
    { name: 'title', label: 'Titre', kind: 'text', bilingual: true, required: true, maxLength: 120 },
    { name: 'description', label: 'Description', kind: 'textarea', bilingual: true, rows: 2, maxLength: 200, hint: 'Une phrase : ce que contient le document.' },
    { name: 'category', label: 'Rubrique', kind: 'select', options: documentCategoryOptions, required: true },
    {
      name: 'file_fr',
      label: 'Fichier PDF',
      kind: 'pdf',
      hint: 'PDF de 10 Mo au plus. Sans fichier, le site annonce « Bientôt disponible ».',
      showIf: (row) => !row.uses_fee_grid,
    },
    {
      name: 'file_en',
      label: 'Version anglaise du PDF (facultatif)',
      kind: 'pdf',
      hint: 'Sans version anglaise, le site anglais propose le même fichier.',
      showIf: (row) => !row.uses_fee_grid,
    },
    { name: 'updated_on', label: 'Date de mise à jour du document', kind: 'date', half: true, hint: 'Remplie toute seule quand vous déposez un fichier.' },
    { name: 'key', label: 'Identifiant', kind: 'slug', slugFrom: 'title', hint: 'Sert au lien direct vers le document. Il ne change plus une fois le document publié.' },
  ],
  defaults: () => ({ category: 'school', file_fr: null, file_en: null, uses_fee_grid: false, position: 0 }),
  order: [
    { column: 'position', ascending: true },
    { column: 'created_at', ascending: true },
  ],
  titleOf: (row) => String(row.title_fr ?? ''),
  subtitleOf: (row) =>
    [labelOf(documentCategoryOptions, row.category), row.uses_fee_grid ? 'Fichier de la page Frais' : row.file_fr ? 'PDF déposé' : 'Bientôt disponible'].join(' · '),
  sitePath: (row) => `/fr/documents/#${row.key}`,
  positionColumn: 'position',
  categoryField: 'category',
};

export const contentConfigs: Record<ContentTable, ContentConfig> = {
  news: newsConfig,
  calendar_events: calendarConfig,
  gallery_photos: galleryConfig,
  documents: documentsConfig,
};

/** Toutes les colonnes de contenu d'une table (celles que l'écran envoie). */
export function contentColumns(config: ContentConfig): string[] {
  const columns = new Set<string>();
  for (const field of config.fields) {
    if (field.bilingual) {
      columns.add(`${field.name}_fr`);
      columns.add(`${field.name}_en`);
    } else {
      columns.add(field.name);
    }
    if (field.thumbColumn) columns.add(field.thumbColumn);
    if (field.sizeColumns) {
      columns.add('width');
      columns.add('height');
    }
  }
  for (const key of Object.keys(config.defaults())) columns.add(key);
  if (config.positionColumn) columns.add(config.positionColumn);
  return [...columns];
}
