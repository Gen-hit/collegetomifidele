import { ArrowRight, Languages } from 'lucide-react';
import { photo } from '@content/photos';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { RichTitle } from '@/components/ui/section-heading';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

/** Les couleurs des trois parcours, dans l'ordre francophone, anglophone, technique. */
const trackChips = ['bg-sky-100 text-blue-600', 'bg-green-100 text-green-700', 'bg-gold-100 text-gold-700'] as const;

/** Accroche de l'accueil : titre, appels à l'action et photo principale sur un décor de blocs colorés. */
export function HomeHero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.hero;
  const tracks = dict.home.programmes.items.map((item) => item.track);

  return (
    <section className="relative overflow-hidden bg-surface-alt pt-10 pb-28 sm:pt-16 lg:pb-32">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-5">
          <p className="flex animate-rise items-center gap-3 text-[13px] leading-4 font-semibold tracking-[0.08em] text-blue-600 uppercase">
            <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-gold-400" />
            {t.eyebrow}
          </p>
          <h1 className="animate-rise font-display text-4xl leading-[1.12] font-bold text-balance text-navy-700 [animation-delay:80ms] sm:text-5xl lg:text-[3.4rem]">
            <RichTitle text={t.title} highlight="mark" />
          </h1>
          <p className="max-w-xl animate-rise text-lg leading-8 text-pretty [animation-delay:160ms]">{t.text}</p>
          <ul className="flex animate-rise flex-wrap gap-2 [animation-delay:220ms]">
            {tracks.map((track, index) => (
              <li
                key={track}
                className={`rounded-full px-3 py-1.5 text-[13px] leading-4 font-semibold tracking-[0.06em] uppercase ${trackChips[index % trackChips.length]}`}
              >
                {track}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex animate-rise flex-wrap gap-3 [animation-delay:280ms]">
            <ButtonLink href={href(locale, '/admissions#preinscription')}>
              {t.primary}
              <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
            </ButtonLink>
            <ButtonLink href={href(locale, '/about')} variant="secondary">
              {t.secondary}
            </ButtonLink>
          </div>
        </div>

        <div className="relative animate-rise [animation-delay:200ms]">
          {/* Décor : blocs aux couleurs du collège derrière la photo. */}
          <div aria-hidden="true" className="absolute -top-5 -right-3 size-28 rounded-2xl bg-gold-400 sm:-right-5" />
          <div aria-hidden="true" className="absolute -bottom-5 -left-3 h-24 w-40 rounded-2xl bg-sky-400 sm:-left-5" />
          <div aria-hidden="true" className="dot-grid absolute -right-4 bottom-10 h-32 w-24 text-navy-700 opacity-50" />
          <PhotoSlot
            label={t.photoLabel}
            src={photo('home.hero')}
            photoWord={dict.common.photo}
            priority
            className="relative border-solid border-white shadow-card ring-1 ring-line"
          />
          <div className="absolute -bottom-6 right-4 flex animate-float items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-float sm:right-8">
            <span className="flex size-11 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Languages aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-lg leading-6 font-bold text-navy-700">{t.badgeTitle}</span>
              <span className="text-sm leading-5 text-muted">{t.badgeText}</span>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
