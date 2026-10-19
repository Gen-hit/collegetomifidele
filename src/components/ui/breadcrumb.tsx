import { ChevronRight, House } from 'lucide-react';
import Link from 'next/link';
import { site } from '@content/site';
import { href, type Locale } from '@/i18n/config';

export type Crumb = { label: string; path: string };

type BreadcrumbProps = {
  locale: Locale;
  /** Du premier niveau jusqu'à la page courante, sans l'accueil (ajouté automatiquement). */
  items: Crumb[];
  homeLabel: string;
  /** Nom accessible de la navigation, par exemple « Fil d'Ariane ». */
  label: string;
};

/**
 * Fil d'Ariane des pages intérieures, posé sur le bandeau sombre.
 * Il publie aussi les données structurées « BreadcrumbList », que Google affiche dans ses résultats.
 */
export function Breadcrumb({ locale, items, homeLabel, label }: BreadcrumbProps) {
  const trail = [{ label: homeLabel, path: '/' }, ...items];
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: new URL(href(locale, crumb.path), site.url).toString(),
    })),
  };

  return (
    <nav aria-label={label} className="animate-rise">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm leading-5">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-x-1.5">
              {index > 0 ? <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-sky-400" strokeWidth={2} /> : null}
              {last ? (
                <span aria-current="page" className="py-2.5 font-semibold text-white">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={href(locale, crumb.path)}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sky-200 underline-offset-4 hover:text-white hover:underline"
                >
                  {index === 0 ? <House aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} /> : null}
                  {/* Sur téléphone, l'accueil se réduit à son pictogramme pour que le fil tienne sur une ligne. */}
                  <span className={index === 0 && trail.length > 2 ? 'sr-only sm:not-sr-only' : undefined}>{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
    </nav>
  );
}
