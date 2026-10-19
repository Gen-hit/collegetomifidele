import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { photo } from '@content/photos';
import { leadership } from '@content/team';
import { CtaBand } from '@/components/sections/cta-band';
import { IntroSplit } from '@/components/sections/intro-split';
import { KeyFigures } from '@/components/sections/key-figures';
import { MottoValues } from '@/components/sections/motto-values';
import { PageHero } from '@/components/sections/page-hero';
import { PrincipalMessage } from '@/components/sections/principal-message';
import { TeamGrid } from '@/components/sections/team-grid';
import { Timeline } from '@/components/sections/timeline';
import { AnchorNav } from '@/components/ui/anchor-nav';
import { ButtonLink } from '@/components/ui/button';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/about';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.about.meta);
}

/** Le collège : présentation, chiffres, histoire, valeurs, mot du Principal et équipe de direction. */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.about;
  const [presentation, histoire, valeurs, equipe] = t.toc.items.map((item) => item.id);

  return (
    <>
      <PageHero
        {...t.hero}
        tone="blue"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [{ label: dict.nav.about.label, path: PATH }],
        }}
      />
      <AnchorNav label={t.toc.label} items={t.toc.items} />
      <IntroSplit
        id={presentation}
        eyebrow={t.overview.eyebrow}
        title={t.overview.title}
        paragraphs={t.overview.paragraphs}
        points={t.overview.points}
        photo={{ label: t.overview.photo, src: photo('about.campus'), word: dict.common.photo }}
        viewer={dict.viewer}
      />
      <KeyFigures locale={locale} dict={dict} keys={['founded', 'students', 'teachers', 'success']} overlap={false} />
      <Timeline id={histoire} {...t.history} />
      <MottoValues id={valeurs} {...t.values} />
      <PrincipalMessage locale={locale} dict={dict} />
      <TeamGrid
        id={equipe}
        locale={locale}
        eyebrow={t.team.eyebrow}
        title={t.team.title}
        people={leadership}
        labels={{ namePlaceholder: t.team.namePlaceholder, photo: t.team.photo, photoWord: dict.common.photo }}
      />
      <CtaBand title={t.cta.title} text={t.cta.text} tone="blue">
        <ButtonLink href={href(locale, '/admissions#preinscription')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/programmes')} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
