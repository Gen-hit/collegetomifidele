import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FollowBand } from '@/components/sections/follow-band';
import { PageHero } from '@/components/sections/page-hero';
import { Container } from '@/components/ui/container';
import { featuredArticle, sortedArticles, toCard } from '@/features/news/articles';
import { NewsList } from '@/features/news/news-list';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/news';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.news.meta);
}

/** Actualités : l'article à la une, puis toutes les actualités, filtrables par rubrique. Les articles viennent de content/news.ts. */
export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.news;

  return (
    <>
      <PageHero
        {...t.hero}
        tone="blue"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [{ label: dict.nav.news.label, path: PATH }],
        }}
      />
      <section className="py-12 sm:py-16">
        <Container>
          <NewsList
            cards={sortedArticles().map((article) => toCard(article, locale, dict))}
            featuredSlug={featuredArticle()?.slug}
            labels={t}
            photoWord={dict.common.photo}
          />
        </Container>
      </section>
      <FollowBand dict={dict} flushTop />
    </>
  );
}
