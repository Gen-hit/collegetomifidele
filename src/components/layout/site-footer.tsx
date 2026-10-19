import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { site } from '@content/site';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { hoursSummary } from '@/lib/hours';
import { formatPhone } from '@/lib/links';
import { SocialLinks } from './social-links';

const exploreLinks = ['about', 'programmes', 'facilities', 'campus', 'news', 'gallery'] as const;
const practicalLinks = ['admissions', 'fees', 'calendar', 'documents', 'contact', 'privacy'] as const;
const paths: Record<string, string> = {
  about: '/about',
  programmes: '/programmes',
  facilities: '/facilities',
  campus: '/campus',
  news: '/news',
  gallery: '/gallery',
  admissions: '/admissions',
  fees: '/admissions/fees',
  calendar: '/calendar',
  documents: '/documents',
  contact: '/contact',
  privacy: '/privacy',
};

/** Pied de page : identité, liens, coordonnées et réseaux sociaux. */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const labels = dict.nav as Record<string, { label: string }>;
  const { common, footer } = dict;
  const address = site.location.address ?? common.addressPlaceholder;
  const city = site.location.city ?? common.cityPlaceholder;
  const linkClass = 'flex min-h-10 items-center text-white underline-offset-4 hover:text-gold-400 hover:underline';

  const column = (title: string, keys: readonly string[]) => (
    <nav aria-label={title} className="flex flex-col">
      <h2 className="mb-2 font-semibold text-sky-400">{title}</h2>
      {keys.map((key) => (
        <Link key={key} href={href(locale, paths[key])} className={linkClass}>
          {labels[key]?.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <footer className="on-dark relative overflow-hidden bg-indigo-900 text-[15px] leading-6 text-white">
      <div aria-hidden="true" className="h-1 w-full bg-gold-400" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-14 pb-28 sm:px-6 sm:pb-10 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="flex size-18 shrink-0 items-center justify-center rounded-2xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={site.logo.src} alt="" width={49} height={56} className="h-14 w-auto" loading="lazy" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-xl leading-6 font-bold">{site.name}</span>
                <span className="text-xs leading-4 font-semibold tracking-[0.06em] whitespace-nowrap text-gold-400 uppercase">
                  {site.motto}
                </span>
              </span>
            </div>
            <p className="max-w-sm">{footer.description}</p>
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-sky-400">{footer.follow}</h2>
              <SocialLinks labels={footer.social} />
            </div>
          </div>

          {column(footer.explore, exploreLinks)}
          {column(footer.practical, practicalLinks)}

          <div className="flex flex-col">
            <h2 className="mb-2 font-semibold text-sky-400">{footer.contact}</h2>
            <p className="flex min-h-10 items-start gap-3 py-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-sky-400" strokeWidth={1.75} />
              <span>
                {address}
                <br />
                {city}
              </span>
            </p>
            {site.contact.phones.length > 0 ? (
              site.contact.phones.map((phone) => (
                <a key={phone} href={`tel:${phone}`} className={`${linkClass} gap-3`}>
                  <Phone aria-hidden="true" className="size-5 shrink-0 text-sky-400" strokeWidth={1.75} />
                  {formatPhone(phone)}
                </a>
              ))
            ) : (
              <p className="flex min-h-10 items-center gap-3">
                <Phone aria-hidden="true" className="size-5 shrink-0 text-sky-400" strokeWidth={1.75} />
                {common.phonePlaceholder}
              </p>
            )}
            {site.contact.email ? (
              <a href={`mailto:${site.contact.email}`} className={`${linkClass} gap-3`}>
                <Mail aria-hidden="true" className="size-5 shrink-0 text-sky-400" strokeWidth={1.75} />
                {site.contact.email}
              </a>
            ) : (
              <p className="flex min-h-10 items-center gap-3">
                <Mail aria-hidden="true" className="size-5 shrink-0 text-sky-400" strokeWidth={1.75} />
                {common.emailPlaceholder}
              </p>
            )}
            <p className="flex min-h-10 items-center gap-3">
              <Clock aria-hidden="true" className="size-5 shrink-0 text-sky-400" strokeWidth={1.75} />
              {hoursSummary(locale, dict)}
            </p>
          </div>
        </div>

        <p className="border-t border-white/20 pt-6 text-sm leading-5">
          © {new Date().getFullYear()} {site.name}. {footer.rights}
        </p>
      </div>
    </footer>
  );
}
