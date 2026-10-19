import { ArrowRight, EyeOff, MapPinned, Send, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { FeatureCards } from '@/components/ui/feature-cards';
import { SectionHeading } from '@/components/ui/section-heading';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fill, formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/metadata';
import type { Tone } from '@/lib/tones';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/privacy';
/** Date de la dernière révision du texte. À changer à chaque modification de messages/<langue>/privacy.json. */
const UPDATED = '2026-10-07';

const summaryLooks: { Icon: LucideIcon; tone: Tone }[] = [
  { Icon: EyeOff, tone: 'blue' },
  { Icon: Send, tone: 'green' },
  { Icon: MapPinned, tone: 'gold' },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.privacy.meta);
}

/**
 * Confidentialité : ce que le site fait, et ne fait pas, des données des visiteurs.
 * Le texte décrit le fonctionnement réel du site ; il est à faire relire par le collège avant la mise en ligne.
 */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.privacy;

  return (
    <>
      <PageHero
        {...t.hero}
        tone="navy"
        chips={[fill(t.updated, { date: formatDate(UPDATED, locale, '') })]}
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [{ label: dict.nav.privacy.label, path: PATH }],
        }}
      />

      <section className="bg-surface-alt py-16 sm:py-20">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.summary.eyebrow} title={t.summary.title} className="reveal" />
          <FeatureCards columns={3} items={t.summary.items.map((item, index) => ({ ...item, ...summaryLooks[index % summaryLooks.length] }))} />
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label={t.toc} className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 text-[13px] leading-4 font-semibold tracking-[0.08em] text-muted uppercase">{t.toc}</p>
            <ol className="flex flex-col border-l-2 border-line">
              {t.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-0.5 flex min-h-11 items-center gap-2 border-l-2 border-transparent py-2 pl-4 text-[15px] leading-5 font-semibold text-navy-700 transition-colors hover:border-gold-400 hover:text-blue-600"
                  >
                    <span aria-hidden="true" className="text-muted tabular-nums">
                      {index + 1}.
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex max-w-3xl flex-col gap-12">
            {t.sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-titre`} className="flex scroll-mt-4 flex-col gap-4">
                <h2 id={`${section.id}-titre`} className="flex items-start gap-3 font-display text-2xl leading-8 font-bold text-pretty text-navy-700">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 font-sans text-[15px] leading-none font-semibold text-blue-600 tabular-nums"
                  >
                    {index + 1}
                  </span>
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-pretty">
                    {paragraph}
                  </p>
                ))}
                {section.points.length > 0 ? (
                  <ul className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-alt p-5">
                    {section.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-[15px] leading-6">
                        <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand title={t.cta.title} text={t.cta.text} tone="blue" flushTop>
        <ButtonLink href={href(locale, '/contact')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale)} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
