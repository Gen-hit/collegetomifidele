import { ArrowRight, CalendarDays, Clock, Download, FileText, Images, Info } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { documentById, localize } from '@content/documents';
import { gallery } from '@content/gallery';
import { photo } from '@content/photos';
import { CtaBand } from '@/components/sections/cta-band';
import { IntroSplit } from '@/components/sections/intro-split';
import { PageHero } from '@/components/sections/page-hero';
import { AnchorNav } from '@/components/ui/anchor-nav';
import { ButtonLink, buttonClass } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { LightboxGroup, LightboxTrigger } from '@/components/ui/lightbox';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/ui/section-heading';
import { calendarItems } from '@/features/calendar/events';
import { UpcomingEvents } from '@/features/calendar/upcoming-events';
import { href, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { pageMetadata } from '@/lib/metadata';
import { toneCycle, tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

const PATH = '/campus';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, PATH, getDictionary(locale).pages.campus.meta);
}

/** Vie scolaire : clubs, horaires et prochaines dates, tenue et règlement, aperçu de la galerie. */
export default async function CampusPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.campus;
  const calendarLabels = dict.pages.calendar;
  const [clubsId, scheduleId, rulesId, galleryId] = t.toc.items.map((item) => item.id);

  const rules = documentById('reglement-interieur')?.file;
  const rulesFile = rules ? localize(rules, locale) : null;
  const buildDate = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHero
        {...t.hero}
        tone="green"
        breadcrumb={{
          locale,
          homeLabel: dict.common.home,
          label: dict.common.breadcrumb,
          items: [{ label: dict.nav.campus.label, path: PATH }],
        }}
      />
      <AnchorNav label={t.toc.label} items={t.toc.items} />

      <section id={clubsId} className="py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t.clubs.eyebrow} title={t.clubs.title} intro={t.clubs.intro} accent="green" className="reveal" />
          <LightboxGroup
            labels={dict.viewer}
            photoWord={dict.common.photo}
            items={t.clubs.items.map((club, index) => ({ src: photo(`campus.clubs.${index + 1}`) ?? null, title: club.name, description: club.text }))}
          >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.clubs.items.map((club, index) => {
              const look = tones[toneCycle[index % toneCycle.length]];
              return (
                <li
                  key={club.photo}
                  className="group reveal relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card"
                >
                  <LightboxTrigger index={index} className="overflow-hidden">
                    <PhotoSlot
                      label={club.photo}
                      src={photo(`campus.clubs.${index + 1}`)}
                      alt={club.name}
                      photoWord={dict.common.photo}
                      ratio="aspect-video"
                      priority={index === 0}
                      className={cn('rounded-none transition-transform duration-500 group-hover:scale-103', !photo(`campus.clubs.${index + 1}`) && 'border-x-0 border-t-0')}
                    />
                  </LightboxTrigger>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute top-3 left-3 flex size-10 items-center justify-center rounded-xl border-2 border-white font-display text-base leading-none font-bold shadow-card',
                      look.tile,
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-1 flex-col gap-1.5 p-5">
                    <h3 className="font-display text-xl leading-7 font-semibold text-navy-700">{club.name}</h3>
                    <p className="flex items-start gap-2 text-[15px] leading-6 text-muted">
                      <Clock aria-hidden="true" className={cn('mt-0.5 size-4.5 shrink-0', look.text)} strokeWidth={1.75} />
                      {club.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          </LightboxGroup>
        </Container>
      </section>

      <section id={scheduleId} className="bg-surface-alt py-16 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading eyebrow={t.schedule.eyebrow} title={t.schedule.title} className="reveal" />
            <dl className="reveal divide-y divide-line rounded-2xl border border-line bg-white px-5">
              {t.schedule.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                  <dt className="flex items-center gap-3 font-semibold">
                    <Clock aria-hidden="true" className="size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
                    {item.label}
                  </dt>
                  <dd className="text-right font-display text-lg leading-6 font-semibold whitespace-nowrap text-navy-700">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="reveal flex items-start gap-3 text-[15px] leading-6 text-muted">
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
              {t.schedule.note}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <SectionHeading eyebrow={t.dates.eyebrow} title={t.dates.title} accent="gold" className="reveal" />
            <div className="reveal">
              <UpcomingEvents
                items={calendarItems(locale, calendarLabels.agenda.range)}
                labels={{ ...calendarLabels.next, empty: t.dates.empty }}
                categories={calendarLabels.categories}
                calendarHref={href(locale, '/calendar')}
                buildDate={buildDate}
                layout="column"
              />
            </div>
            <ButtonLink href={href(locale, '/calendar')} variant="secondary" className="reveal self-start">
              <CalendarDays aria-hidden="true" className="size-5" strokeWidth={1.75} />
              {t.dates.cta}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <IntroSplit
        id={rulesId}
        eyebrow={t.rules.eyebrow}
        title={t.rules.title}
        paragraphs={t.rules.paragraphs}
        points={t.rules.points}
        photo={{ label: t.rules.photo, src: photo('campus.uniform'), word: dict.common.photo }}
        viewer={dict.viewer}
        tone="navy"
        flip
      >
        <div className="mt-2 flex flex-wrap gap-3">
          {rulesFile ? (
            // Lien direct vers le fichier, sans passer par le routeur du site.
            <a href={rulesFile} download className={buttonClass()}>
              <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
              {t.rules.download}
            </a>
          ) : null}
          <ButtonLink href={href(locale, '/documents')} variant={rulesFile ? 'secondary' : 'primary'}>
            <FileText aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t.rules.documents}
          </ButtonLink>
        </div>
      </IntroSplit>

      <section id={galleryId} className="bg-surface-alt py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} accent="green" />
            <ButtonLink href={href(locale, '/gallery')} variant="secondary">
              <Images aria-hidden="true" className="size-5" strokeWidth={1.75} />
              {t.gallery.cta}
            </ButtonLink>
          </div>
          <LightboxGroup
            labels={dict.viewer}
            photoWord={dict.common.photo}
            items={gallery.slice(0, 4).map((item) => ({ src: item.src, thumb: item.thumb, title: item.caption[locale], description: item.description?.[locale] }))}
          >
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
              {gallery.slice(0, 4).map((item, index) => (
                <li key={index} className="group reveal">
                  <LightboxTrigger index={index} className="overflow-hidden rounded-2xl">
                    <PhotoSlot
                      label={`${item.caption[locale]} · 1:1`}
                      src={item.thumb ?? item.src ?? undefined}
                      alt={item.caption[locale]}
                      photoWord={dict.common.photo}
                      ratio="aspect-square"
                      className="transition-transform duration-500 group-hover:scale-103"
                    />
                  </LightboxTrigger>
                </li>
              ))}
            </ul>
          </LightboxGroup>
        </Container>
      </section>

      <CtaBand title={t.cta.title} text={t.cta.text} tone="green">
        <ButtonLink href={href(locale, '/admissions#preinscription')}>
          {t.cta.primary}
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </ButtonLink>
        <ButtonLink href={href(locale, '/contact')} variant="secondary">
          {t.cta.secondary}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
