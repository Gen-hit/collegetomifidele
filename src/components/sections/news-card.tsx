import { ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { PhotoSlot } from '@/components/ui/photo-slot';
import type { NewsCardData } from '@/features/news/articles';
import { tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

type NewsCardProps = {
  card: NewsCardData;
  photoWord: string;
  /** Grande carte « À la une » : photo à gauche, résumé et lien « Lire la suite ». */
  featured?: { label: string; readMore: string };
  /** Affiche le résumé sous le titre (liste des actualités). L'accueil s'en passe. */
  withSummary?: boolean;
  /** Niveau du titre selon la page : h2 sous le titre de page, h3 dans une section. */
  as?: 'h2' | 'h3';
  /** La première photo visible d'une page ne doit pas être chargée en différé. */
  priority?: boolean;
};

function Meta({ card }: { card: NewsCardData }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className={cn('rounded-md px-2 py-1 text-xs leading-4 font-semibold tracking-[0.06em] uppercase', tones[card.tone].badge)}>{card.categoryLabel}</span>
      <span className="flex items-center gap-1.5 text-sm leading-5 text-muted">
        <CalendarDays aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
        {card.date}
      </span>
    </div>
  );
}

/** Carte d'actualité entièrement cliquable : photo, rubrique, date, titre et, au besoin, résumé. */
export function NewsCard({ card, photoWord, featured, withSummary = false, as: Title = 'h3', priority = false }: NewsCardProps) {
  if (featured) {
    return (
      <Link
        href={card.href}
        className="group grid overflow-hidden rounded-3xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card md:grid-cols-2"
      >
        <div className="relative overflow-hidden">
          <PhotoSlot
            label={card.coverLabel}
            src={card.cover ?? undefined}
            alt={card.coverAlt}
            photoWord={photoWord}
            ratio="aspect-video md:aspect-auto md:h-full md:min-h-80"
            priority={priority}
            className={cn(
              'rounded-none transition-transform duration-500 group-hover:scale-103',
              // L'emplacement en pointillés ne garde que le trait qui le sépare du texte.
              !card.cover && 'border-0 border-b-[1.5px] md:border-r-[1.5px] md:border-b-0',
            )}
          />
          <span className="absolute top-4 left-4 rounded-md bg-gold-400 px-2.5 py-1 text-xs leading-4 font-semibold tracking-[0.06em] text-ink uppercase shadow-card">
            {featured.label}
          </span>
        </div>
        <div className="flex flex-col items-start justify-center gap-3 p-6 sm:p-8 lg:p-10">
          <Meta card={card} />
          <Title className="font-display text-2xl leading-8 font-bold text-pretty text-navy-700 sm:text-[28px] sm:leading-9">{card.title}</Title>
          <p className="text-pretty">{card.summary}</p>
          <span className="mt-1 inline-flex min-h-11 items-center gap-2 font-semibold text-blue-600 underline-offset-4 group-hover:underline">
            {featured.readMore}
            <ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={card.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      <div className="overflow-hidden">
        <PhotoSlot
          label={card.coverLabel}
          src={card.cover ?? undefined}
          alt={card.coverAlt}
          photoWord={photoWord}
          ratio="aspect-video"
          priority={priority}
          className={cn('rounded-none transition-transform duration-500 group-hover:scale-103', !card.cover && 'border-x-0 border-t-0')}
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-2.5 p-5">
        <Meta card={card} />
        <Title className="font-display text-xl leading-6 font-semibold text-pretty text-ink group-hover:text-navy-700">{card.title}</Title>
        {withSummary ? <p className="text-[15px] leading-6 text-pretty text-muted">{card.summary}</p> : null}
      </div>
    </Link>
  );
}
