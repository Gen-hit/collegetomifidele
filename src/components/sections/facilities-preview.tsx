import { ArrowRight, FlaskConical, Hammer, Library, Monitor, type LucideIcon } from 'lucide-react';
import { photo } from '@content/photos';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { LightboxGroup, LightboxTrigger } from '@/components/ui/lightbox';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/ui/section-heading';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';

const looks: { Icon: LucideIcon; tile: string }[] = [
  { Icon: FlaskConical, tile: 'bg-sky-100 text-blue-500' },
  { Icon: Monitor, tile: 'bg-green-100 text-green-700' },
  { Icon: Hammer, tile: 'bg-gold-100 text-gold-700' },
  { Icon: Library, tile: 'bg-sky-100 text-navy-700' },
];

/** Aperçu des infrastructures : quatre photos légendées et un lien vers la page complète. */
export function FacilitiesPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.facilities;

  return (
    <section className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} accent="green" />
          <ButtonLink href={href(locale, '/facilities')} variant="secondary">
            {t.cta}
            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
          </ButtonLink>
        </div>
        <LightboxGroup
          labels={dict.viewer}
          photoWord={dict.common.photo}
          items={t.items.map((name, index) => ({ src: photo(`home.facilities.${index + 1}`) ?? null, title: name }))}
        >
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
          {t.items.map((name, index) => {
            const { Icon, tile } = looks[index % looks.length];
            return (
              <li key={name} className="group reveal flex flex-col gap-3">
                <LightboxTrigger index={index} className="overflow-hidden rounded-2xl">
                  <PhotoSlot
                    label={`${name} · 4:3`}
                    src={photo(`home.facilities.${index + 1}`)}
                    alt={name}
                    photoWord={dict.common.photo}
                    className="transition-transform duration-500 group-hover:scale-103"
                  />
                </LightboxTrigger>
                <p className="flex items-center gap-2.5 font-semibold">
                  <span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-[10px]', tile)}>
                    <Icon className="size-4.5" strokeWidth={1.75} />
                  </span>
                  {name}
                </p>
              </li>
            );
          })}
        </ul>
        </LightboxGroup>
      </Container>
    </section>
  );
}
