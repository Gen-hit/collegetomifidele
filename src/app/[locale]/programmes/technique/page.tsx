import { ArrowRight, BookOpen, Briefcase, Hammer, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { photo } from '@content/photos';
import { CtaBand } from '@/components/sections/cta-band';
import { DiplomaColumns } from '@/components/sections/diploma-columns';
import { IntroSplit } from '@/components/sections/intro-split';
import { PageHero } from '@/components/sections/page-hero';
import { PhotoStrip } from '@/components/sections/photo-strip';
import { SpecialityGrid } from '@/components/sections/speciality-grid';
import { AnchorNav } from '@/components/ui/anchor-nav';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { FeatureCards } from '@/components/ui/feature-cards';
import { SectionHeading } from '@/components/ui/section-heading';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';
import type { Tone } from '@/lib/tones';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/programmes/technique';

/** Pictogramme et couleur des trois temps de la formation : cours, travaux pratiques, stage ou projet. */
const methodLooks: { Icon: LucideIcon; tone: Tone }[] = [
  { Icon: BookOpen, tone: 'blue' },
  { Icon: Hammer, tone: 'gold' },
  { Icon: Briefcase, tone: 'green' },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.technique.meta);
}

/** Enseignement technique : présentation, spécialités, pédagogie, diplômes et ateliers. */
export default async function TechniquePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.technique;
  const [specialites, pedagogie, diplomes, ateliers] = t.toc.items.map((item) => item.id);

  return (
    <>
      <PageHero
        {...t.hero}
        tone="gold"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.programmes.label, path: '/programmes' },
            { label: dict.nav.technique.label, path: PATH },
          ],
        }}
      />
      <AnchorNav label={t.toc.label} items={t.toc.items} />
      <IntroSplit
        eyebrow={t.overview.eyebrow}
        title={t.overview.title}
        paragraphs={t.overview.paragraphs}
        photo={{ label: t.overview.photo, src: photo('technique.overview'), word: dict.common.photo }}
        viewer={dict.viewer}
        tone="gold"
      />
      <SpecialityGrid id={specialites} {...t.specialities} />
      <section id={pedagogie} className="py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.method.eyebrow} title={t.method.title} className="reveal" />
          <FeatureCards columns={3} numbered items={t.method.items.map((item, index) => ({ ...item, ...methodLooks[index % methodLooks.length] }))} />
        </Container>
      </section>
      <DiplomaColumns id={diplomes} {...t.diplomas} />
      <PhotoStrip
        id={ateliers}
        eyebrow={t.workshops.eyebrow}
        title={t.workshops.title}
        photoWord={dict.common.photo}
        viewer={dict.viewer}
        photos={t.workshops.photos.map((label, index) => ({ label, src: photo(`technique.workshops.${index + 1}`) }))}
        tone="gold"
      />
      <CtaBand title={t.cta.title} text={t.cta.text} flushTop>
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
