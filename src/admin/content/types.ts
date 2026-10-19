/** Une ligne d'un contenu du site, telle que la base la renvoie. Les colonnes propres à chaque contenu sont libres. */
export type ContentStatus = 'draft' | 'submitted' | 'published';

export type ContentRow = {
  id: string;
  status: ContentStatus;
  pending: Record<string, unknown> | null;
  pending_by: string | null;
  pending_at: string | null;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  [column: string]: unknown;
};

/** Colonnes gérées par la base : jamais envoyées par l'écran. */
export const metaColumns = [
  'id',
  'school_id',
  'status',
  'pending',
  'pending_by',
  'pending_at',
  'published_at',
  'published_by',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
] as const;

export type ContentTable = 'news' | 'calendar_events' | 'gallery_photos' | 'documents';

export type FieldKind = 'text' | 'textarea' | 'markdown' | 'select' | 'date' | 'checkbox' | 'image' | 'pdf' | 'slug';

export type FieldOption = { value: string; label: string };

export type FieldConfig = {
  /** Nom de colonne ; pour un champ bilingue, le nom de base (colonnes `<nom>_fr` et `<nom>_en`). */
  name: string;
  label: string;
  kind: FieldKind;
  bilingual?: boolean;
  required?: boolean;
  hint?: string;
  options?: FieldOption[];
  rows?: number;
  maxLength?: number;
  /** Image : colonne de la vignette, et colonnes de dimensions si la table en a. */
  thumbColumn?: string;
  sizeColumns?: boolean;
  /** Identifiant fabriqué à partir d'un champ texte bilingue (son nom de base). */
  slugFrom?: string;
  /** Moitié de largeur sur ordinateur. */
  half?: boolean;
  /** Masqué tant que la condition n'est pas remplie. */
  showIf?: (row: Record<string, unknown>) => boolean;
};

export type ContentConfig = {
  table: ContentTable;
  /** Adresse de la liste dans l'administration. */
  path: string;
  title: string;
  /** « l’actualité », « la date »… */
  one: string;
  newLabel: string;
  /** Dossier des fichiers déposés : <école>/<dossier>/… */
  folder: string;
  fields: FieldConfig[];
  defaults: () => Record<string, unknown>;
  /** Ordre de la liste. */
  order: { column: string; ascending: boolean; nullsFirst?: boolean }[];
  /** Titre d'une ligne dans les listes. */
  titleOf: (row: Record<string, unknown>) => string;
  subtitleOf: (row: Record<string, unknown>) => string;
  thumbOf?: (row: Record<string, unknown>) => string | null;
  /** Adresse de la ligne sur le site public, une fois en ligne. */
  sitePath?: (row: Record<string, unknown>) => string;
  /** Contrôles propres au contenu, en plus des champs obligatoires : { colonne: message }. */
  validate?: (row: Record<string, unknown>) => Record<string, string>;
  /** Colonne de rangement manuel (photos, documents). */
  positionColumn?: string;
  /** Filtre par catégorie dans la liste. */
  categoryField?: string;
  /** Rangement par défaut d'une nouvelle ligne : dans les listes, les plus récentes d'abord. */
  emptyText: string;
};
