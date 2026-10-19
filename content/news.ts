import newsData from './data/news.json';

/**
 * Les actualités du collège : la liste, la page de chaque article et les trois cartes de l'accueil lisent ce fichier.
 *
 * PUBLIER UNE ACTUALITÉ (sans back-office) : copier un bloc de content/data/news.json, puis changer
 *   - `slug`     : l'adresse de l'article (…/news/<slug>/), en minuscules, sans accent ni espace. Ne plus le changer ensuite.
 *   - `date`     : la date de publication, 'AAAA-MM-JJ'. Les articles sont classés du plus récent au plus ancien.
 *   - `category` : 'academic', 'sport', 'culture', 'announcement' ou 'life'.
 *   - `cover`    : la photo de couverture, déposée dans public/photos/actualites/ (format 16:9, WebP).
 *   - `featured` : `true` sur l'article à mettre « À la une » (un seul ; sinon le plus récent est choisi).
 *   - le titre, le résumé et le texte, en français et en anglais.
 *
 * ÉCRIRE LE TEXTE (`body`) : du texte simple, un paragraphe par bloc, une ligne vide entre deux blocs.
 *   ## Un intertitre
 *   > Une citation
 *   > — Son auteur
 *   - une liste à puces (une ligne par élément)
 *   ![Légende de la photo](/photos/actualites/photo.webp)   deux lignes de ce type à la suite : deux photos côte à côte
 *   **texte en gras** et [texte d'un lien](https://exemple.cm)
 *
 * Les quatre articles fournis sont des MODÈLES (`sample: true`) : ils montrent la mise en page et ne sont pas
 * signalés à Google. Les remplacer par de vraies actualités, ou les supprimer.
 *
 * D'OÙ VIENNENT LES DONNÉES
 *   Elles sont dans content/data/news.json. Quand le back-office est relié (réglages NEXT_PUBLIC_SUPABASE_URL et
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY), ce fichier est réécrit à chaque construction du site avec le contenu publié dans
 *   l'administration (/admin) : on les modifie alors là-bas, pas ici. Sans back-office, on modifie
 *   directement content/data/news.json, en gardant la forme décrite ci-dessous.
 */
export type NewsCategory = 'academic' | 'sport' | 'culture' | 'announcement' | 'life';

export type Article = {
  slug: string;
  /** Date de publication, 'AAAA-MM-JJ'. `null` : emplacement « [Date de publication] ». */
  date: string | null;
  category: NewsCategory;
  featured?: boolean;
  /** Article modèle : texte entre crochets, à remplacer. */
  sample?: boolean;
  /** Chemin de la photo de couverture. `null` : un emplacement décrit la photo attendue. */
  cover: string | null;
  /** Ce que montre la photo de couverture : sert de légende et de texte alternatif. */
  coverCaption: { fr: string; en: string };
  title: { fr: string; en: string };
  /** Une ou deux phrases : l'essentiel pour le parent pressé. Affiché sur les cartes et en tête d'article. */
  summary: { fr: string; en: string };
  body: { fr: string; en: string };
};

/** L'ordre des catégories dans les filtres. Les libellés sont dans messages/<langue>/news.json. */
export const newsCategories: NewsCategory[] = ['academic', 'sport', 'culture', 'announcement', 'life'];

export const articles = newsData as Article[];
