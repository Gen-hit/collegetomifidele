import { notFound } from 'next/navigation';
import { AdmissionsBand } from '@/components/sections/admissions-band';
import { ContactCta } from '@/components/sections/contact-cta';
import { FacilitiesPreview } from '@/components/sections/facilities-preview';
import { FindUs } from '@/components/sections/find-us';
import { HomeHero } from '@/components/sections/home-hero';
import { KeyFigures } from '@/components/sections/key-figures';
import { NewsPreview } from '@/components/sections/news-preview';
import { PrincipalMessage } from '@/components/sections/principal-message';
import { ProgrammesOverview } from '@/components/sections/programmes-overview';
import { Strengths } from '@/components/sections/strengths';
import { Testimonial } from '@/components/sections/testimonial';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { schoolJsonLd } from '@/lib/structured';

/** Accueil : l'enchaînement des blocs validés sur la maquette, plus « Nous trouver ». */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <HomeHero locale={locale} dict={dict} />
      <KeyFigures locale={locale} dict={dict} />
      <PrincipalMessage locale={locale} dict={dict} />
      <Strengths dict={dict} />
      <ProgrammesOverview locale={locale} dict={dict} />
      <FacilitiesPreview locale={locale} dict={dict} />
      <AdmissionsBand locale={locale} dict={dict} />
      <NewsPreview locale={locale} dict={dict} />
      <Testimonial dict={dict} />
      <FindUs locale={locale} dict={dict} />
      <ContactCta locale={locale} dict={dict} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd(locale, dict)) }} />
    </>
  );
}
