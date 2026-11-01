import { ArrowRight, BadgeInfo, CircleCheck, Wallet } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fees } from '@content/fees';
import { site } from '@content/site';
import { CtaBand } from '@/components/sections/cta-band';
import { FeeGrid } from '@/components/sections/fee-grid';
import { PageHero } from '@/components/sections/page-hero';
import { PaymentMethods } from '@/components/sections/payment-methods';
import { AnchorNav } from '@/components/ui/anchor-nav';
import { ButtonLink } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { FeeSimulator } from '@/features/fees/fee-simulator';
import { schoolYear } from '@/features/fees/highlights';
import { lowestTuition } from '@/features/fees/simulate';
import { hiddenSections, visibleToc } from '@/features/visibility';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';
import { pageMetadata } from '@/lib/metadata';
import { showPlaceholders } from '@/lib/placeholders';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/admissions/fees';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.fees.meta);
}

/** Frais et paiement : grille par niveau, simulateur, moyens de paiement. Les montants viennent de content/fees.ts. */
export default async function FeesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.fees;
  const [grille, simulateur, paiement, aSavoir] = t.toc.items.map((item) => item.id);
  const year = schoolYear(dict);
  // Tant qu'aucun montant ni aucune date n'est publié, le nombre de tranches reste un emplacement.
  const published = lowestTuition(fees) !== null || fees.deadlines.some((deadline) => deadline !== null);
  const instalmentCount = published ? fees.deadlines.length : t.grid.countPlaceholder;
  const hidden = hiddenSections(dict);
  // Sans aucun montant publié, la grille et le simulateur cèdent la place à un encart d'attente.
  const pending = lowestTuition(fees) === null && !showPlaceholders;
  const notes = t.notes.items.filter(Boolean);

  return (
    <>
      <PageHero
        {...t.hero}
        intro={hidden.has(`${PATH}#${simulateur}`) ? t.hero.introShort : t.hero.intro}
        tone="gold"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.admissions.label, path: '/admissions' },
            { label: dict.nav.fees.label, path: PATH },
          ],
        }}
      />
      <AnchorNav label={t.toc.label} items={visibleToc(dict, PATH, t.toc.items)} />

      <section id={grille} className="py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <div className="reveal flex flex-col gap-4">
            {year ? (
              <Chip tone="gold" className="self-start">
                {fill(t.year, { year })}
              </Chip>
            ) : null}
            <SectionHeading eyebrow={t.grid.eyebrow} title={t.grid.title} intro={pending ? undefined : fill(t.grid.intro, { count: instalmentCount })} accent="gold" />
          </div>
          {pending ? (
            <div className="reveal flex max-w-3xl flex-col gap-4 rounded-3xl border border-gold-400/50 bg-gold-100 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
              <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-gold-700">
                <Wallet className="size-7" strokeWidth={1.75} />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <p className="font-display text-xl leading-7 font-bold text-navy-700">{t.grid.pendingTitle}</p>
                <p className="text-[15px] leading-6 text-pretty">{t.grid.pendingText}</p>
              </div>
              <ButtonLink href={href(locale, '/contact')} variant="secondary" className="shrink-0 self-start sm:self-center">
                {t.cta.secondary}
              </ButtonLink>
            </div>
          ) : (
            <FeeGrid locale={locale} labels={t} />
          )}
        </Container>
      </section>

      {hidden.has(`${PATH}#${simulateur}`) ? null : (
      <section id={simulateur} className="bg-surface-alt py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.simulator.eyebrow} title={t.simulator.title} intro={t.simulator.intro} className="reveal" />
          <FeeSimulator
            locale={locale}
            labels={t.simulator}
            grid={{
              instalments: t.grid.instalments,
              before: t.grid.before,
              deadlinePlaceholder: t.grid.deadlinePlaceholder,
              sections: t.grid.sections,
            }}
            amountPlaceholder={t.amountPlaceholder}
            school={site.name}
            year={year}
            pageUrl={new URL(href(locale, PATH), site.url).toString()}
            applyHref={href(locale, '/admissions#preinscription')}
          />
        </Container>
      </section>
      )}

      <PaymentMethods id={paiement} labels={t.payment} />

      {notes.length ? (
      <section id={aSavoir} className="bg-surface-alt py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHeading eyebrow={t.notes.eyebrow} title={t.notes.title} accent="green" className="reveal" />
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note} className="reveal flex items-start gap-3 rounded-2xl border border-line bg-white p-5">
                {note.startsWith('[') ? (
                  <BadgeInfo aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" strokeWidth={1.75} />
                ) : (
                  <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-green-700" strokeWidth={2} />
                )}
                {note}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      ) : null}

      <CtaBand title={t.cta.title} text={t.cta.text}>
        <ButtonLink href={href(locale, '/admissions#preinscription')}>
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
