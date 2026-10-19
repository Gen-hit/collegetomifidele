import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { gallery } from '@content/gallery';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { GalleryGrid } from '@/features/gallery/gallery-grid';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/gallery';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.gallery.meta);
}

/** Galerie photo : les photos de content/gallery.ts, filtrables par thème, avec une visionneuse plein écran. */
export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.gallery;

  return (
    <>
      <PageHero
        {...t.hero}
        tone="green"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.campus.label, path: '/campus' },
            { label: dict.nav.gallery.label, path: PATH },
          ],
        }}
      />
      <section className="py-12 sm:py-16">
        <Container>
          <GalleryGrid
            photos={gallery.map((photo) => ({
              src: photo.src,
              thumb: photo.thumb,
              category: photo.category,
              caption: photo.caption[locale],
              description: photo.description?.[locale],
            }))}
            labels={t}
            viewer={dict.viewer}
            photoWord={dict.common.photo}
          />
        </Container>
      </section>
      <CtaBand title={t.cta.title} text={t.cta.text} tone="green" flushTop>
        <ButtonLink href={href(locale, '/admissions#preinscription')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/campus')} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
