import { ArrowLeft, CalendarDays, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles } from '@content/news';
import { site } from '@content/site';
import { ArticleBody } from '@/components/sections/article-body';
import { NewsCard } from '@/components/sections/news-card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { LightboxGroup, LightboxTrigger } from '@/components/ui/lightbox';
import { Notice } from '@/components/ui/notice';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/ui/section-heading';
import { ShareRow } from '@/components/ui/share-buttons';
import { categoryTone, relatedArticles, sortedArticles, toCard } from '@/features/news/articles';
import { href, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { parseArticle, readingMinutes } from '@/lib/article';
import { fill, formatDate, typo } from '@/lib/format';
import { pageMetadata } from '@/lib/metadata';
import { tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

/** Une page par article et par langue. */
export function generateStaticParams() {
  return locales.flatMap((locale) => sortedArticles().map((article) => ({ locale, slug: article.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!isLocale(locale) || !article) return {};
  const base = pageMetadata(locale, `/news/${slug}`, { title: article.title[locale], description: article.summary[locale] });
  return {
    ...base,
    // Un article modèle ne doit jamais apparaître dans Google, même une fois le site référencé.
    // Pour un vrai article, on ne touche pas à la règle générale du site (voir le layout).
    ...(article.sample ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: article.date ?? undefined,
      // Sans photo de couverture, le lien partagé garde l'image générale du collège.
      images: article.cover ? [{ url: article.cover, alt: article.coverCaption[locale] }] : base.openGraph?.images,
    },
  };
}

/** Un article : en-tête, photo de couverture, texte, partage, puis « À lire aussi ». */
export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!isLocale(locale) || !article) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.news;
  const a = t.article;

  const title = typo(article.title[locale], locale);
  const summary = typo(article.summary[locale], locale);
  const body = typo(article.body[locale], locale);
  const path = href(locale, `/news/${slug}`);
  const related = relatedArticles(slug);
  const blocks = parseArticle(body);
  const caption = article.coverCaption[locale];
  // La visionneuse de l'article : la photo de couverture, puis les photos du texte dans l'ordre.
  const pictures = [
    { src: article.cover, title: caption },
    ...blocks.flatMap((block) => (block.type === 'images' ? block.images.map((image) => ({ src: image.src, title: image.caption })) : [])),
  ];

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: summary,
    datePublished: article.date,
    inLanguage: locale,
    image: article.cover ? [new URL(article.cover, site.url).toString()] : undefined,
    mainEntityOfPage: new URL(path, site.url).toString(),
    publisher: { '@type': 'EducationalOrganization', name: site.name, logo: new URL(site.logo.src, site.url).toString() },
  };

  return (
    <>
      {/* Bandeau fin, à la couleur du site : le fil d'Ariane situe l'article comme sur les autres pages. */}
      <div className="on-dark relative bg-indigo-900 py-1 text-white">
        <Container>
          <Breadcrumb
            locale={locale}
            homeLabel={dict.common.home}
            label={dict.common.breadcrumb}
            items={[
              { label: dict.nav.news.label, path: '/news' },
              { label: t.categories[article.category], path: `/news/${slug}` },
            ]}
          />
        </Container>
        <div aria-hidden="true" className={cn('absolute inset-x-0 bottom-0 h-1', tones[categoryTone[article.category]].onDarkBar)} />
      </div>
      <LightboxGroup items={pictures} labels={dict.viewer} photoWord={dict.common.photo}>
      <article className="pt-6 pb-16 sm:pt-8 sm:pb-24">
        <Container className="flex max-w-3xl flex-col gap-6">
          <Link
            href={href(locale, '/news')}
            className="group inline-flex min-h-11 items-center gap-2 self-start font-semibold text-blue-600 underline-offset-4 hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4.5 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
            {a.back}
          </Link>

          <header className="flex animate-rise flex-col gap-3">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-5 text-muted">
              <span className={cn('rounded-md px-2 py-1 text-xs leading-4 font-semibold tracking-[0.06em] uppercase', tones[categoryTone[article.category]].badge)}>
                {t.categories[article.category]}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                {fill(a.published, { date: formatDate(article.date, locale, t.datePlaceholder) })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                {fill(a.readingTime, { minutes: readingMinutes(summary, body) })}
              </span>
            </p>
            <h1 className="font-display text-3xl leading-[1.2] font-bold text-balance text-navy-700 sm:text-[42px]">{title}</h1>
            <p className="text-lg leading-[30px] text-pretty text-muted">{summary}</p>
          </header>

          <figure className="flex flex-col gap-2">
            <LightboxTrigger index={0} className="overflow-hidden rounded-2xl">
              <PhotoSlot label={`${caption} · ${t.coverRatio}`} src={article.cover ?? undefined} alt={caption} photoWord={a.coverWord} ratio="aspect-video" priority />
            </LightboxTrigger>
            {article.cover ? <figcaption className="text-sm leading-5 text-muted">{caption}</figcaption> : null}
          </figure>

          {article.sample ? (
            <Notice tone="warning" title={a.sample.title}>
              {a.sample.text}
            </Notice>
          ) : null}

          <ArticleBody blocks={blocks} photoWord={dict.common.photo} photoRatio={a.photoRatio} />

          <ShareRow
            path={path}
            title={title}
            text={fill(a.shareText, { title, school: site.name })}
            labels={dict.common.share}
            className="mt-2 border-t border-line pt-6"
          />
        </Container>
        {article.sample || !article.date ? null : <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />}
      </article>
      </LightboxGroup>

      {related.length > 0 ? (
        <section className="bg-surface-alt py-16 sm:py-24">
          <Container className="flex flex-col gap-10">
            <SectionHeading eyebrow={a.related.eyebrow} title={a.related.title} className="reveal" />
            <ul className="grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug} className="reveal">
                  <NewsCard card={toCard(item, locale, dict)} photoWord={dict.common.photo} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
