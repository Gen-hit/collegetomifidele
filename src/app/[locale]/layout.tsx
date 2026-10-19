import '@fontsource-variable/figtree';
import '@fontsource/zilla-slab/600.css';
import '@fontsource/zilla-slab/700.css';
import '../globals.css';

import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { site } from '@content/site';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { HelpLauncher } from '@/components/layout/help-launcher';
import { NavigationProgress } from '@/components/layout/navigation-progress';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Splash } from '@/components/layout/splash';
import { schoolYear } from '@/features/fees/highlights';
import { href, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';
import { whatsappLink } from '@/lib/links';
import { shareImage } from '@/lib/metadata';

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: '#2b2e83' };

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.title, template: `%s · ${site.name}` },
    description: dict.meta.description,
    // Tant que le site est en test (pas de nom de domaine), il reste hors de Google.
    robots: site.indexable ? undefined : { index: false, follow: false },
    icons: { icon: site.logo.src },
    // Vaut pour l'accueil ; chaque page intérieure indique sa propre adresse (voir pageMetadata).
    alternates: { canonical: href(locale), languages: { fr: href('fr'), en: href('en') } },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
      url: href(locale),
      images: [shareImage(locale)],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const { topics, ...assistantLabels } = dict.assistant;

  return (
    // `suppressHydrationWarning` : le script de l'écran d'accueil pose un attribut sur <html> avant React.
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Splash />
        <NavigationProgress />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-navy-700 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
        >
          {dict.common.skip}
        </a>
        {site.announcement.enabled ? (
          <AnnouncementBar
            text={fill(dict.announcement.text, { year: schoolYear(dict) })}
            cta={dict.announcement.cta}
            dismissLabel={dict.announcement.dismiss}
            href={href(locale, site.announcement.path)}
          />
        ) : null}
        <SiteHeader locale={locale} dict={dict} />
        <main id="contenu">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
        <HelpLauncher
          locale={locale}
          labels={dict.help}
          assistantLabels={assistantLabels}
          topics={topics.map((topic) => ({
            id: topic.id,
            label: topic.label,
            answer: topic.answer,
            linkLabel: topic.linkLabel,
            href: href(locale, topic.path),
          }))}
          whatsappHref={whatsappLink(locale, dict.help.whatsappMessage)}
        />
      </body>
    </html>
  );
}
