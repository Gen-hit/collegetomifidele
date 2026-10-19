'use client';

import { ChevronDown, Newspaper } from 'lucide-react';
import { useState } from 'react';
import { newsCategories, type NewsCategory } from '@content/news';
import { NewsCard } from '@/components/sections/news-card';
import { buttonClass } from '@/components/ui/button';
import { FilterChips, type FilterOption } from '@/components/ui/filter-chips';
import { Notice } from '@/components/ui/notice';
import type { Dictionary } from '@/i18n/dictionaries';
import type { NewsCardData } from './articles';

type Filter = NewsCategory | 'all';

type NewsListProps = {
  /** Les articles, du plus récent au plus ancien. */
  cards: NewsCardData[];
  /** L'article « À la une » : affiché en grand tant qu'aucun filtre n'est choisi. */
  featuredSlug?: string;
  labels: Dictionary['pages']['news'];
  photoWord: string;
  /** Nombre de cartes affichées avant le bouton « Afficher plus ». */
  pageSize?: number;
};

/** La liste des actualités : filtre par rubrique, article à la une, puis les cartes par lots. */
export function NewsList({ cards, featuredSlug, labels, photoWord, pageSize = 6 }: NewsListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [limit, setLimit] = useState(pageSize);

  const featured = filter === 'all' ? cards.find((card) => card.slug === featuredSlug) : undefined;
  const list = cards.filter((card) => (filter === 'all' ? card.slug !== featured?.slug : card.category === filter));
  const shown = list.slice(0, limit);

  const options: FilterOption<Filter>[] = [
    { value: 'all', label: labels.filters.all, count: cards.length, Icon: Newspaper },
    ...newsCategories
      .map((category) => ({ value: category as Filter, label: labels.categories[category], count: cards.filter((card) => card.category === category).length }))
      .filter((option) => option.count > 0),
  ];

  const change = (value: Filter) => {
    setFilter(value);
    setLimit(pageSize);
  };

  return (
    <div className="flex flex-col gap-10">
      <FilterChips label={labels.filters.label} options={options} value={filter} onChange={change} />

      {featured ? <NewsCard card={featured} photoWord={photoWord} featured={{ label: labels.featured, readMore: labels.readMore }} as="h2" priority /> : null}

      {shown.length > 0 ? (
        <div className="flex flex-col gap-6">
          {featured ? <h2 className="font-display text-2xl leading-8 font-bold text-navy-700 sm:text-[28px] sm:leading-9">{labels.listTitle}</h2> : null}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((card) => (
              <li key={card.slug}>
                <NewsCard card={card} photoWord={photoWord} withSummary as={featured ? 'h3' : 'h2'} />
              </li>
            ))}
          </ul>
        </div>
      ) : featured ? null : (
        <Notice className="max-w-3xl">{labels.empty}</Notice>
      )}

      {list.length > limit ? (
        <button type="button" onClick={() => setLimit((current) => current + pageSize)} className={buttonClass('secondary', 'self-center')}>
          {labels.more}
          <ChevronDown aria-hidden="true" className="size-5" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
