import { ExternalLink, Mail, MapPin, Navigation, Phone, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { site } from '@content/site';
import { FollowBand } from '@/components/sections/follow-band';
import { MapFacade } from '@/components/sections/map-facade';
import { PageHero } from '@/components/sections/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ContactForm } from '@/features/contact/contact-form';
import { familyRequestsEnabled } from '@/features/requests/send';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { openingRows } from '@/lib/hours';
import { formatPhone, maps, whatsappLink } from '@/lib/links';
import { pageMetadata } from '@/lib/metadata';
import { schoolJsonLd } from '@/lib/structured';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/contact';
const linkClass = 'inline-flex min-h-11 items-center gap-2 font-semibold text-blue-600 underline underline-offset-4 hover:text-navy-700';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.contact.meta);
}

function InfoCard({ Icon, tone, title, children }: { Icon: LucideIcon; tone: Tone; title: string; children: ReactNode }) {
  return (
    <li className="reveal relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-white p-6">
      <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', tones[tone].bar)} />
      <span aria-hidden="true" className={cn('flex size-11 items-center justify-center rounded-[10px]', tones[tone].tile)}>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h2 className="mt-1 font-display text-xl leading-7 font-semibold text-navy-700">{title}</h2>
      <div className="flex flex-col items-start">{children}</div>
    </li>
  );
}

/** Contact : coordonnées, formulaire vers WhatsApp, plan d'accès, heures d'ouverture et réseaux sociaux. */
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.contact;
  const { common } = dict;
  const map = dict.home.findUs;
  const { phones, whatsapp, email } = site.contact;

  return (
    <>
      <PageHero
        {...t.hero}
        tone="gold"
        breadcrumb={{
          locale,
          homeLabel: common.home,
          label: common.breadcrumb,
          items: [{ label: dict.nav.contact.label, path: PATH }],
        }}
      />

      <section className="bg-surface-alt py-12 sm:py-16">
        <Container>
          <ul className="grid gap-4 md:grid-cols-3">
            <InfoCard Icon={MapPin} tone="blue" title={t.cards.address}>
              <p className="py-2.5 font-semibold">
                {site.location.address ?? common.addressPlaceholder}
                <br />
                {site.location.city ?? common.cityPlaceholder}
              </p>
              <a href={maps.directionsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <Navigation aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                {t.cards.directions}
              </a>
            </InfoCard>
            <InfoCard Icon={Phone} tone="gold" title={t.cards.phones}>
              {phones.length > 0 ? (
                phones.map((phone) => (
                  <a key={phone} href={`tel:${phone}`} className={linkClass}>
                    {formatPhone(phone)}
                  </a>
                ))
              ) : (
                <p className="py-2.5 font-semibold">{common.phonePlaceholder}</p>
              )}
            </InfoCard>
            <InfoCard Icon={Mail} tone="green" title={t.cards.messaging}>
              {whatsapp ? (
                <a href={whatsappLink(locale, dict.help.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <FaWhatsapp aria-hidden="true" className="size-4.5 text-green-700" />
                  {formatPhone(`+${whatsapp}`)}
                </a>
              ) : (
                <p className="flex items-center gap-2 py-2.5 font-semibold">
                  <FaWhatsapp aria-hidden="true" className="size-4.5 shrink-0 text-green-700" />
                  {common.phonePlaceholder}
                </p>
              )}
              {email ? (
                <a href={`mailto:${email}`} className={cn(linkClass, 'break-all')}>
                  {email}
                </a>
              ) : (
                <p className="py-2.5 font-semibold">{common.emailPlaceholder}</p>
              )}
            </InfoCard>
          </ul>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-14">
          <div id="ecrire" className="flex flex-col gap-8">
            <SectionHeading eyebrow={t.form.eyebrow} title={t.form.title} intro={familyRequestsEnabled ? t.form.intro : t.form.whatsappOnly.intro} accent="green" className="reveal" />
            <div className="reveal">
              <ContactForm labels={t.form} school={site.name} whatsapp={whatsapp} email={email} privacyHref={href(locale, '/privacy')} locale={locale} />
            </div>
          </div>

          <div id="acces" className="flex flex-col gap-6 lg:pt-7">
            <div className="reveal flex flex-col gap-4">
              <h2 className="font-display text-2xl leading-8 font-bold text-navy-700">{t.access.title}</h2>
              <MapFacade embedUrl={maps.embedUrl} title={map.mapTitle} loadLabel={map.load} note={map.loadNote} />
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={maps.directionsUrl} target="_blank">
                  <Navigation aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  {map.directions}
                </ButtonLink>
                <ButtonLink href={maps.placeUrl} target="_blank" variant="secondary">
                  {map.open}
                  <ExternalLink aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
                </ButtonLink>
              </div>
            </div>

            <div className="reveal rounded-2xl border border-line bg-surface-alt px-5 py-4">
              <h2 className="pb-1 font-display text-xl leading-7 font-semibold text-navy-700">{t.hours.title}</h2>
              <dl className="divide-y divide-line">
                {openingRows(locale, dict, t.hours.placeholder).map((row) => (
                  <div key={row.key} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="font-semibold">{row.days}</dt>
                    <dd className={cn('text-right', row.closed && 'text-muted')}>{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <FollowBand dict={dict} flushTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd(locale, dict)) }} />
    </>
  );
}
