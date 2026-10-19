import { ArrowRight } from 'lucide-react';
import { NewsCard } from '@/components/sections/news-card';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { sortedArticles, toCard } from '@/features/news/articles';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

/** Les trois dernières actualités, lues dans content/news.ts. Sans aucun article, le bloc disparaît de l'accueil. */
export function NewsPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.news;
  const latest = sortedArticles().slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section className="py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          <ButtonLink href={href(locale, '/news')} variant="secondary">
            {t.cta}
            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
          </ButtonLink>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {latest.map((article) => (
            <li key={article.slug} className="reveal">
              <NewsCard card={toCard(article, locale, dict)} photoWord={dict.common.photo} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
