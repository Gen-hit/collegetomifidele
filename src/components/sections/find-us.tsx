import { Clock, ExternalLink, MapPin, Navigation, Phone, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { site } from '@content/site';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { hoursSummary } from '@/lib/hours';
import { formatPhone, maps } from '@/lib/links';
import { cn } from '@/lib/utils';
import { MapFacade } from './map-facade';

function InfoRow({ Icon, tile, label, children }: { Icon: LucideIcon; tile: string; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-[10px]', tile)}>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <p className="flex flex-col">
        <span className="text-sm leading-5 text-muted">{label}</span>
        <span className="font-semibold">{children}</span>
      </p>
    </li>
  );
}

/** « Nous trouver » : adresse, horaires, carte à la demande et itinéraire. Le dernier bloc d'information de l'accueil. */
export function FindUs({ locale, dict, id = 'nous-trouver' }: { locale: Locale; dict: Dictionary; id?: string }) {
  const t = dict.home.findUs;
  const { common } = dict;
  const phone = site.contact.phones[0];

  return (
    <section id={id} className="py-16 sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <div className="reveal flex flex-col gap-7">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} intro={t.text} accent="gold" />
          <ul className="flex flex-col gap-4">
            <InfoRow Icon={MapPin} tile="bg-sky-100 text-blue-500" label={t.addressLabel}>
              {site.location.address ?? common.addressPlaceholder}
              <br />
              {site.location.city ?? common.cityPlaceholder}
            </InfoRow>
            <InfoRow Icon={Clock} tile="bg-green-100 text-green-700" label={t.hoursLabel}>
              {hoursSummary(locale, dict)}
            </InfoRow>
            <InfoRow Icon={Phone} tile="bg-gold-100 text-gold-700" label={t.phoneLabel}>
              {phone ? (
                <a href={`tel:${phone}`} className="text-blue-600 underline underline-offset-4">
                  {formatPhone(phone)}
                </a>
              ) : (
                common.phonePlaceholder
              )}
            </InfoRow>
          </ul>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={maps.directionsUrl} target="_blank">
              <Navigation aria-hidden="true" className="size-5" strokeWidth={1.75} />
              {t.directions}
            </ButtonLink>
            <ButtonLink href={maps.placeUrl} target="_blank" variant="secondary">
              {t.open}
              <ExternalLink aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
            </ButtonLink>
          </div>
        </div>
        <div className="reveal relative">
          <div aria-hidden="true" className="absolute -top-4 -right-4 size-24 rounded-2xl bg-green-700" />
          <div aria-hidden="true" className="absolute -bottom-4 -left-4 h-20 w-32 rounded-2xl bg-gold-400" />
          <div className="relative">
            <MapFacade embedUrl={maps.embedUrl} title={t.mapTitle} loadLabel={t.load} note={t.loadNote} />
          </div>
        </div>
      </Container>
    </section>
  );
}
