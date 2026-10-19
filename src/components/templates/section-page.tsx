import { ArrowRight } from 'lucide-react';
import { photo } from '@content/photos';
import { CtaBand } from '@/components/sections/cta-band';
import { CycleCards } from '@/components/sections/cycle-cards';
import { IntroSplit } from '@/components/sections/intro-split';
import { PageHero } from '@/components/sections/page-hero';
import { PhotoStrip } from '@/components/sections/photo-strip';
import { ResultsTeaser } from '@/components/sections/results-teaser';
import { ButtonLink } from '@/components/ui/button';
import { resultItems } from '@/features/results/teaser';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { trackTone } from '@/lib/tones';

/** Ce qui distingue les deux sections : leur langue, la section « d'en face » et les examens affichés en aperçu. */
const sections = {
  francophone: { lang: 'fr', other: 'anglophone', ctaTone: 'blue', exams: ['bepc', 'probatoire', 'baccalaureat'] },
  anglophone: { lang: 'en', other: 'francophone', ctaTone: 'green', exams: ['gce-ol', 'gce-al', 'gce-tech'] },
} as const;

export type SectionKey = keyof typeof sections;

/**
 * Gabarit commun aux pages « Section francophone » et « Anglophone section ».
 * Seuls les textes (messages/<langue>/sections.json), les photos et la couleur changent.
 */
export function SectionPage({ locale, dict, section }: { locale: Locale; dict: Dictionary; section: SectionKey }) {
  const t = dict.pages.sections[section];
  const { lang, other, ctaTone, exams } = sections[section];
  const tone = trackTone[section];
  const path = `/programmes/${section}`;

  return (
    <>
      <PageHero
        {...t.hero}
        tone={tone}
        titleLang={lang}
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.programmes.label, path: '/programmes' },
            { label: dict.nav[section].label, path },
          ],
        }}
      />
      <IntroSplit
        eyebrow={t.overview.eyebrow}
        title={t.overview.title}
        paragraphs={t.overview.paragraphs}
        photo={{ label: t.overview.photo, src: photo(`${section}.overview`), word: dict.common.photo }}
        viewer={dict.viewer}
        tone={tone}
      />
      <CycleCards
        eyebrow={t.cycles.eyebrow}
        title={t.cycles.title}
        examLabel={t.cycles.examLabel}
        items={t.cycles.items}
        tone={tone}
        classLang={lang}
      />
      <PhotoStrip
        eyebrow={t.gallery.eyebrow}
        title={t.gallery.title}
        photoWord={dict.common.photo}
        viewer={dict.viewer}
        photos={t.gallery.photos.map((label, index) => ({ label, src: photo(`${section}.gallery.${index + 1}`) }))}
        tone={tone}
      />
      <ResultsTeaser
        eyebrow={t.results.eyebrow}
        title={t.results.title}
        text={t.results.text}
        items={resultItems([...exams], locale, dict)}
        link={{ label: t.results.link, href: href(locale, '/results') }}
        tone={tone}
        alt
      />
      <CtaBand title={t.cta.title} text={t.cta.text} tone={ctaTone}>
        <ButtonLink href={href(locale, '/admissions')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, `/programmes/${other}`)} variant="secondary" lang={sections[other].lang}>
          {t.cta.other}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
