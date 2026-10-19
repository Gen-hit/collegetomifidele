import { ArrowRight, Clock, FolderOpen, Phone, Search, Send, Wallet, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa6';
import { site } from '@content/site';
import { ExamDates } from '@/components/sections/exam-dates';
import { Faq } from '@/components/sections/faq';
import { FeesTeaser } from '@/components/sections/fees-teaser';
import { PageHero } from '@/components/sections/page-hero';
import { AnchorNav } from '@/components/ui/anchor-nav';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { FeatureCards } from '@/components/ui/feature-cards';
import { SectionHeading } from '@/components/ui/section-heading';
import { schoolYear } from '@/features/fees/highlights';
import { PreinscriptionForm } from '@/features/preinscription/preinscription-form';
import { familyRequestsEnabled } from '@/features/requests/send';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';
import { hoursSummary } from '@/lib/hours';
import { formatPhone, whatsappLink } from '@/lib/links';
import { pageMetadata } from '@/lib/metadata';
import type { Tone } from '@/lib/tones';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/admissions';

/** Pictogramme et couleur des quatre étapes de la procédure. */
const stepLooks: { Icon: LucideIcon; tone: Tone }[] = [
  { Icon: Search, tone: 'blue' },
  { Icon: Send, tone: 'green' },
  { Icon: FolderOpen, tone: 'navy' },
  { Icon: Wallet, tone: 'gold' },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.admissions.meta);
}

/** Admissions : procédure, aperçu des frais, concours, pièces à fournir, questions fréquentes et préinscription. */
export default async function AdmissionsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.admissions;
  const [procedure, frais, concours, faq, preinscription] = t.toc.items.map((item) => item.id);
  const phone = site.contact.phones[0];

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={fill(t.hero.title, { year: schoolYear(dict) })}
        intro={t.hero.intro}
        tone="gold"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [{ label: dict.nav.admissions.label, path: PATH }],
        }}
      >
        <div className="mt-3 flex animate-rise flex-wrap gap-3 [animation-delay:220ms]">
          <ButtonLink href={`#${preinscription}`} variant="gold">
            {t.hero.primary}
            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
          </ButtonLink>
          <ButtonLink href={href(locale, '/admissions/fees')} variant="ghost">
            {t.hero.secondary}
          </ButtonLink>
        </div>
      </PageHero>
      <AnchorNav label={t.toc.label} items={t.toc.items} />

      <section id={procedure} className="py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.steps.eyebrow} title={t.steps.title} className="reveal" />
          <FeatureCards numbered items={t.steps.items.map((item, index) => ({ ...item, ...stepLooks[index % stepLooks.length] }))} />
        </Container>
      </section>

      <FeesTeaser id={frais} locale={locale} dict={dict} />
      <ExamDates id={concours} locale={locale} exams={t.exams} documents={t.documents} />
      <Faq id={faq} {...t.faq} />

      <section id={preinscription} className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="reveal flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow={t.form.eyebrow} title={t.form.title} intro={familyRequestsEnabled ? t.form.intro : t.form.whatsappOnly.intro} accent="green" />
            <div className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-100 p-5">
              <p className="font-display text-lg leading-6 font-semibold text-navy-700">{t.form.contactTitle}</p>
              <p className="flex items-center gap-3">
                <Phone aria-hidden="true" className="size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
                <span>
                  {t.form.call}{' '}
                  {phone ? (
                    <a href={`tel:${phone}`} className="font-semibold text-blue-600 underline underline-offset-4">
                      {formatPhone(phone)}
                    </a>
                  ) : (
                    <span className="font-semibold">{dict.common.phonePlaceholder}</span>
                  )}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <FaWhatsapp aria-hidden="true" className="size-5 shrink-0 text-green-700" />
                <span>
                  {t.form.whatsapp}{' '}
                  {site.contact.whatsapp ? (
                    <a
                      href={whatsappLink(locale, dict.help.whatsappMessage)}
                      className="font-semibold text-blue-600 underline underline-offset-4"
                    >
                      {formatPhone(`+${site.contact.whatsapp}`)}
                    </a>
                  ) : (
                    <span className="font-semibold">{dict.common.phonePlaceholder}</span>
                  )}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Clock aria-hidden="true" className="size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
                <span>{hoursSummary(locale, dict)}</span>
              </p>
            </div>
          </div>
          <div className="reveal">
            <PreinscriptionForm
              labels={t.form}
              school={site.name}
              whatsapp={site.contact.whatsapp}
              contactHref={href(locale, '/contact')}
              privacyHref={href(locale, '/privacy')}
              locale={locale}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
