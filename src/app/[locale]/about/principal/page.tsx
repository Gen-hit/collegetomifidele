import { ArrowRight, BookOpen, History, Users, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { PrincipalLetter } from '@/components/sections/principal-letter';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { LinkCards } from '@/components/ui/link-cards';
import { SectionHeading } from '@/components/ui/section-heading';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';
import type { Tone } from '@/lib/tones';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/about/principal';

/** Pictogramme et couleur des trois raccourcis de fin de page, dans l'ordre du fichier de textes. */
const looks: { Icon: LucideIcon; tone: Tone }[] = [
  { Icon: History, tone: 'gold' },
  { Icon: Users, tone: 'green' },
  { Icon: BookOpen, tone: 'blue' },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.principal.meta);
}

/** Mot du Principal : le message complet du chef d'établissement. */
export default async function PrincipalPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.principal;
  const cta = dict.pages.about.cta;

  return (
    <>
      <PageHero
        {...t.hero}
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.about.label, path: '/about' },
            { label: dict.nav.principal.label, path: PATH },
          ],
        }}
      />
      <PrincipalLetter locale={locale} dict={dict} />
      <section className="bg-surface-alt py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.more.eyebrow} title={t.more.title} accent="gold" className="reveal" />
          <LinkCards
            items={t.more.items.map((item, index) => ({
              label: item.label,
              text: item.text,
              href: href(locale, item.path),
              ...looks[index % looks.length],
            }))}
          />
        </Container>
      </section>
      <CtaBand title={cta.title} text={cta.text} tone="blue">
        <ButtonLink href={href(locale, '/admissions#preinscription')}>
          {cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/programmes')} variant="secondary">
          {cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
