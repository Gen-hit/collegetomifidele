import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionPage } from '@/components/templates/section-page';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, '/programmes/anglophone', getDictionary(locale).pages.sections.anglophone.meta);
}

/** Les textes sont dans messages/<langue>/sections.json, la mise en page dans components/templates/section-page.tsx. */
export default async function AnglophoneSectionPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SectionPage locale={locale} dict={getDictionary(locale)} section="anglophone" />;
}
