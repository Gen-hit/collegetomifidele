import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa6';
import { documents } from '@content/documents';
import { CtaBand } from '@/components/sections/cta-band';
import { DocumentList } from '@/components/sections/document-list';
import { PageHero } from '@/components/sections/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { whatsappLink } from '@/lib/links';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/documents';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.documents.meta);
}

/** Documents : les fichiers à télécharger listés dans content/documents.ts, rangés par rubrique. */
export default async function DocumentsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.documents;

  return (
    <>
      <PageHero
        {...t.hero}
        tone="blue"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [
            { label: dict.nav.campus.label, path: '/campus' },
            { label: dict.nav.documents.label, path: PATH },
          ],
        }}
      />
      <DocumentList locale={locale} documents={documents} labels={t} viewer={dict.viewer} photoWord={dict.common.photo} />
      <CtaBand title={t.help.title} text={t.help.text} tone="blue" flushTop>
        <ButtonLink href={whatsappLink(locale, t.help.whatsappMessage)} variant="whatsapp">
          <FaWhatsapp aria-hidden="true" className="size-5" />
          {t.help.primary}
        </ButtonLink>
        <ButtonLink href={href(locale, '/contact')} variant="secondary">
          {t.help.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
