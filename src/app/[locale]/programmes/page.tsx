import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { photo } from '@content/photos';
import { CtaBand } from '@/components/sections/cta-band';
import { IntroSplit } from '@/components/sections/intro-split';
import { PageHero } from '@/components/sections/page-hero';
import { PathwayTable } from '@/components/sections/pathway-table';
import { ResultsTeaser } from '@/components/sections/results-teaser';
import { SectionCards } from '@/components/sections/section-cards';
import { AnchorNav } from '@/components/ui/anchor-nav';
import { ButtonLink } from '@/components/ui/button';
import { resultItems } from '@/features/results/teaser';
import { Chip } from '@/components/ui/chip';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/programmes';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.programmes.meta);
}

/** Programmes : les deux sections, la correspondance des classes, l'enseignement technique et les résultats. */
export default async function ProgrammesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.programmes;
  const [sections, correspondance, technique, resultats] = t.toc.items.map((item) => item.id);

  return (
    <>
      <PageHero
        {...t.hero}
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [{ label: dict.nav.programmes.label, path: PATH }],
        }}
      />
      <AnchorNav label={t.toc.label} items={t.toc.items} />
      <SectionCards
        id={sections}
        eyebrow={t.sections.eyebrow}
        title={t.sections.title}
        intro={t.sections.intro}
        photoWord={dict.common.photo}
        items={t.sections.items.map((item) => ({
          track: item.track,
          badge: item.badge,
          title: item.title,
          sub: item.sub,
          groups: item.groups,
          photo: { label: item.photo, src: photo(`programmes.${item.track}`) },
          link: { label: item.link, href: href(locale, `/programmes/${item.track}`) },
        }))}
      />
      <PathwayTable id={correspondance} {...t.pathway} />
      <IntroSplit
        id={technique}
        eyebrow={t.technique.eyebrow}
        title={t.technique.title}
        paragraphs={[t.technique.text]}
        photo={{ label: t.technique.photo, src: photo('programmes.technique'), word: dict.common.photo }}
        viewer={dict.viewer}
        tone="gold"
        flip
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] leading-4 font-semibold tracking-[0.08em] text-muted uppercase">{t.technique.specialitiesLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {t.technique.specialities.map((name) => (
              <li key={name}>
                <Chip tone="gold">{name}</Chip>
              </li>
            ))}
          </ul>
        </div>
        <ButtonLink href={href(locale, '/programmes/technique')} variant="secondary" className="mt-2 self-start">
          {t.technique.link}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
      </IntroSplit>
      <ResultsTeaser
        id={resultats}
        eyebrow={t.results.eyebrow}
        title={t.results.title}
        text={t.results.text}
        items={resultItems(['bepc', 'baccalaureat', 'gce-ol', 'gce-al'], locale, dict)}
        link={{ label: t.results.link, href: href(locale, '/results') }}
        alt
      />
      <CtaBand title={t.cta.title} text={t.cta.text}>
        <ButtonLink href={href(locale, '/admissions')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/contact')} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
