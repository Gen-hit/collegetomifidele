'use client';

import { ChevronDown, Images } from 'lucide-react';
import { useMemo, useState } from 'react';
import { galleryCategories, type GalleryCategory } from '@content/gallery';
import { buttonClass } from '@/components/ui/button';
import { FilterChips, type FilterOption } from '@/components/ui/filter-chips';
import { LightboxGroup, LightboxTrigger, type LightboxLabels } from '@/components/ui/lightbox';
import { Notice } from '@/components/ui/notice';
import { PhotoSlot } from '@/components/ui/photo-slot';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';

type Filter = GalleryCategory | 'all';

export type GalleryItem = { src: string | null; thumb?: string; category: GalleryCategory; caption: string; description?: string };

type GalleryGridProps = {
  photos: GalleryItem[];
  labels: Dictionary['pages']['gallery'];
  viewer: LightboxLabels;
  photoWord: string;
  /** Nombre de photos affichées avant le bouton « Afficher plus ». */
  pageSize?: number;
};

/**
 * La galerie : filtre par thème et grille de vignettes. Chaque vignette s'ouvre dans la visionneuse,
 * qui fait défiler les photos du thème choisi avec leur légende et leur description.
 */
export function GalleryGrid({ photos, labels, viewer, photoWord, pageSize = 12 }: GalleryGridProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [limit, setLimit] = useState(pageSize);

  const list = useMemo(() => (filter === 'all' ? photos : photos.filter((photo) => photo.category === filter)), [photos, filter]);
  const items = useMemo(() => list.map((photo) => ({ src: photo.src, thumb: photo.thumb, title: photo.caption, description: photo.description })), [list]);
  const shown = list.slice(0, limit);

  const options: FilterOption<Filter>[] = [
    { value: 'all', label: labels.filters.all, count: photos.length, Icon: Images },
    ...galleryCategories
      .map((category) => ({ value: category as Filter, label: labels.categories[category], count: photos.filter((photo) => photo.category === category).length }))
      .filter((option) => option.count > 0),
  ];

  const change = (value: Filter) => {
    setFilter(value);
    setLimit(pageSize);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <FilterChips label={labels.filters.label} options={options} value={filter} onChange={change} />
        <p aria-live="polite" className="text-sm leading-5 font-semibold text-muted">
          {fill(list.length === 1 ? labels.count.one : labels.count.other, { count: list.length })}
        </p>
      </div>

      {list.length === 0 ? <Notice className="max-w-3xl">{labels.empty}</Notice> : null}

      <LightboxGroup items={items} labels={viewer} photoWord={photoWord}>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {shown.map((photo, index) => (
            <li key={`${photo.caption}-${index}`} className="group">
              <LightboxTrigger index={index} className="overflow-hidden rounded-2xl bg-surface-alt">
                <PhotoSlot
                  label={`${photo.caption} · 1:1`}
                  src={photo.thumb ?? photo.src ?? undefined}
                  alt={photo.caption}
                  photoWord={photoWord}
                  ratio="aspect-square"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                {photo.src ? (
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-indigo-950/85 to-transparent p-3 pt-10 pr-14 text-sm leading-5 font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-has-focus-visible:opacity-100">
                    {photo.caption}
                  </span>
                ) : null}
              </LightboxTrigger>
            </li>
          ))}
        </ul>
      </LightboxGroup>

      {photos.some((photo) => photo.src === null) ? <p className="text-sm leading-5 text-muted">{labels.pending}</p> : null}

      {list.length > limit ? (
        <button type="button" onClick={() => setLimit((value) => value + pageSize)} className={buttonClass('secondary', 'self-center')}>
          {labels.more}
          <ChevronDown aria-hidden="true" className="size-5" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
