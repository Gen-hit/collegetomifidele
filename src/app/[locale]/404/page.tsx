import { ArrowLeft, CalendarDays, ClipboardList, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/sections/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { LinkCards } from '@/components/ui/link-cards';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).notFound;
  // Ni adresse de référence ni version dans l'autre langue : cette page n'a pas d'adresse propre.
  return { title: t.eyebrow, description: t.text, robots: { index: false, follow: true }, alternates: {} };
}

/**
 * Page « introuvable », aux couleurs du site. L'hébergeur la sert pour toute adresse qui n'existe pas
 * (règles de renvoi dans netlify.toml), en français ou en anglais selon le début de l'adresse.
 */
export default async function NotFoundPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.notFound;
  const nav = dict.nav;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} intro={t.text} tone="gold">
        <div className="mt-4 flex animate-rise flex-wrap gap-3 [animation-delay:220ms]">
          <ButtonLink href={href(locale)} variant="gold">
            <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={2} />
            {t.back}
          </ButtonLink>
          <ButtonLink href={href(locale, '/contact')} variant="ghost">
            {t.contact}
          </ButtonLink>
        </div>
      </PageHero>
      <section className="py-16 sm:py-20">
        <Container className="flex flex-col gap-6">
          <h2 className="font-display text-2xl leading-8 font-bold text-navy-700">{t.linksTitle}</h2>
          <LinkCards
            items={[
              { label: nav.admissions.label, text: nav.procedure.desc, href: href(locale, '/admissions'), Icon: ClipboardList, tone: 'gold' },
              { label: nav.calendar.label, text: nav.calendar.desc, href: href(locale, '/calendar'), Icon: CalendarDays, tone: 'blue' },
              { label: nav.contact.label, text: dict.home.cta.text, href: href(locale, '/contact'), Icon: Phone, tone: 'green' },
            ]}
          />
        </Container>
      </section>
    </>
  );
}
