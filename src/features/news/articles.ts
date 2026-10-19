import { articles, type Article, type NewsCategory } from '@content/news';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { formatDate, typo } from '@/lib/format';
import type { Tone } from '@/lib/tones';

/** La teinte de l'étiquette de chaque rubrique. */
export const categoryTone: Record<NewsCategory, Tone> = {
  academic: 'blue',
  sport: 'green',
  culture: 'gold',
  announcement: 'navy',
  life: 'green',
};

/**
 * Contrôle content/news.ts, puis classe les articles du plus récent au plus ancien.
 * Les articles sans date (les modèles) viennent ensuite, dans l'ordre du fichier.
 */
export function sortedArticles(list: Article[] = articles): Article[] {
  const seen = new Set<string>();
  for (const article of list) {
    const where = `content/news.ts, article « ${article.slug} »`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(article.slug)) throw new Error(`${where} : l'adresse (slug) ne doit contenir que des minuscules, des chiffres et des tirets.`);
    if (seen.has(article.slug)) throw new Error(`${where} : cette adresse (slug) est utilisée deux fois.`);
    seen.add(article.slug);
    if (article.date !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(article.date) || Number.isNaN(Date.parse(`${article.date}T00:00:00Z`)))) {
      throw new Error(`${where} : la date « ${article.date} » n'est pas au format AAAA-MM-JJ.`);
    }
  }
  return list
    .map((article, index) => ({ article, index }))
    .sort((a, b) => {
      if (a.article.date && b.article.date) return b.article.date.localeCompare(a.article.date) || a.index - b.index;
      if (a.article.date) return -1;
      if (b.article.date) return 1;
      return a.index - b.index;
    })
    .map(({ article }) => article);
}

/**
 * L'article « À la une » : celui marqué `featured`, sinon le plus récent.
 * Dès qu'une vraie actualité existe, un article modèle ne peut plus occuper cette place.
 */
export function featuredArticle(list: Article[] = articles): Article | undefined {
  const sorted = sortedArticles(list);
  const real = sorted.filter((article) => !article.sample);
  const pool = real.length > 0 ? real : sorted;
  return pool.find((article) => article.featured) ?? pool[0];
}

/** « À lire aussi » : d'abord la même rubrique, puis les plus récents. */
export function relatedArticles(slug: string, count = 3, list: Article[] = articles): Article[] {
  const sorted = sortedArticles(list);
  const current = sorted.find((article) => article.slug === slug);
  const others = sorted.filter((article) => article.slug !== slug);
  if (!current) return others.slice(0, count);
  return [...others.filter((article) => article.category === current.category), ...others.filter((article) => article.category !== current.category)].slice(0, count);
}

/** Ce qu'une carte d'actualité affiche, dans une langue. */
export type NewsCardData = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  category: NewsCategory;
  categoryLabel: string;
  tone: Tone;
  /** Date de publication en toutes lettres, ou son emplacement. */
  date: string;
  cover: string | null;
  /** Description de la photo attendue : « Cérémonie ou remise de prix · 16:9 ». */
  coverLabel: string;
  coverAlt: string;
};

export function toCard(article: Article, locale: Locale, dict: Dictionary): NewsCardData {
  const t = dict.pages.news;
  return {
    slug: article.slug,
    href: href(locale, `/news/${article.slug}`),
    title: typo(article.title[locale], locale),
    summary: typo(article.summary[locale], locale),
    category: article.category,
    categoryLabel: t.categories[article.category],
    tone: categoryTone[article.category],
    date: formatDate(article.date, locale, t.datePlaceholder),
    cover: article.cover,
    coverLabel: `${article.coverCaption[locale]} · ${t.coverRatio}`,
    coverAlt: article.coverCaption[locale],
  };
}
