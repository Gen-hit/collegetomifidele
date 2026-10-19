import {
  ArrowRight,
  Building2,
  FlaskConical,
  Hammer,
  HeartPulse,
  Library,
  Monitor,
  ShieldCheck,
  UserCheck,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { photo } from '@content/photos';
import { CtaBand } from '@/components/sections/cta-band';
import { FacilityRows } from '@/components/sections/facility-rows';
import { PageHero } from '@/components/sections/page-hero';
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

const PATH = '/facilities';

/**
 * Pictogramme et couleur de chaque espace, par sa clé (`key` dans messages/<langue>/facilities.json).
 * Pour ajouter un espace : une entrée ici, une dans les deux fichiers de textes, une photo dans content/photos.ts.
 */
const looks: Record<string, { Icon: LucideIcon; tone: Tone }> = {
  labs: { Icon: FlaskConical, tone: 'blue' },
  computers: { Icon: Monitor, tone: 'green' },
  workshops: { Icon: Hammer, tone: 'gold' },
  library: { Icon: Library, tone: 'navy' },
  sports: { Icon: Volleyball, tone: 'green' },
  other: { Icon: Building2, tone: 'gold' },
};

const safetyLooks: { Icon: LucideIcon; tone: Tone }[] = [
  { Icon: ShieldCheck, tone: 'blue' },
  { Icon: UserCheck, tone: 'gold' },
  { Icon: HeartPulse, tone: 'green' },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.facilities.meta);
}

/** Infrastructures : les espaces du collège en images, puis la sécurité. */
export default async function FacilitiesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.facilities;

  return (
    <>
      <PageHero
        {...t.hero}
        tone="green"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [{ label: dict.nav.facilities.label, path: PATH }],
        }}
      />
      <AnchorNav label={t.toc.label} items={t.items.map((item) => ({ id: item.key, label: item.short }))} />
      <FacilityRows
        photoWord={dict.common.photo}
        viewer={dict.viewer}
        items={t.items.map((item) => ({
          key: item.key,
          title: item.title,
          text: item.text,
          features: item.features,
          photo: { label: item.photo, src: photo(`facilities.${item.key}`) },
          ...(looks[item.key] ?? looks.other),
        }))}
      />
      <section className="bg-surface-alt py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.safety.eyebrow} title={t.safety.title} accent="green" className="reveal" />
          <FeatureCards columns={3} items={t.safety.items.map((item, index) => ({ ...item, ...safetyLooks[index % safetyLooks.length] }))} />
        </Container>
      </section>
      <CtaBand title={t.cta.title} text={t.cta.text} tone="green">
        <ButtonLink href={href(locale, '/contact')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/gallery')} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
