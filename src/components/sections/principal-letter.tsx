import { ArrowRight, CalendarClock, Quote } from 'lucide-react';
import { site } from '@content/site';
import { principal } from '@content/team';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

/** Le message complet du Principal : portrait qui reste visible à gauche, lettre à droite. */
export function PrincipalLetter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { letter, meet } = dict.pages.principal;
  const [first, ...rest] = letter.paragraphs.filter(Boolean);
  const name = principal.name ?? letter.namePlaceholder;
  const role = principal.role[locale];

  return (
    <section className="py-16 sm:py-24">
      <Container className="grid gap-12 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-16">
        <aside className="reveal flex flex-col gap-5 md:sticky md:top-28 md:self-start">
          <div className="relative mx-auto w-full max-w-70 md:max-w-none">
            <div aria-hidden="true" className="absolute -top-4 -left-4 size-24 rounded-2xl bg-gold-400" />
            <div aria-hidden="true" className="dot-grid absolute -right-4 -bottom-4 size-24 text-navy-700" />
            <PhotoSlot
              label={letter.photoLabel}
              src={principal.photo ?? undefined}
              alt={principal.name ?? undefined}
              photoWord={dict.common.photo}
              ratio="aspect-3/4"
              priority
              className="relative"
            />
          </div>
          <p className="flex flex-col text-center md:text-left">
            {name ? <span className="font-display text-xl leading-7 font-bold text-navy-700">{name}</span> : null}
            <span className="text-sm leading-5 font-semibold text-gold-700">{role}</span>
          </p>
        </aside>

        <div className="flex flex-col gap-10">
          {first ? (
          <article className="reveal flex max-w-2xl flex-col gap-5">
            <p className="font-display text-2xl leading-8 font-bold text-navy-700 sm:text-[1.7rem]">{letter.greeting}</p>
            <p className="text-lg leading-8 text-pretty">{first}</p>
            {letter.quote ? (
              <blockquote className="relative my-2 rounded-2xl bg-gold-100 p-6 pl-8 font-display text-xl leading-8 font-semibold text-pretty text-navy-700 sm:p-8 sm:pl-10 sm:text-2xl sm:leading-9">
                <span aria-hidden="true" className="absolute inset-y-6 left-0 w-1.5 rounded-r-full bg-gold-400" />
                <Quote aria-hidden="true" className="mb-2 size-8 text-gold-700" strokeWidth={1.75} />
                {letter.quote}
              </blockquote>
            ) : null}
            {rest.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
            <p className="mt-2 flex flex-col border-t border-line pt-5">
              {name ? <span className="font-display text-xl leading-7 font-bold text-navy-700">{name}</span> : null}
              <span className="text-sm leading-5 text-muted">{role}</span>
              <span lang="fr" className="mt-2 text-xs leading-4 font-semibold tracking-[0.08em] text-gold-700 uppercase">
                {site.motto}
              </span>
            </p>
          </article>
          ) : (
            // Le message n'est pas encore rédigé : la devise du collège et une phrase d'attente, plutôt qu'une page vide.
            <div className="reveal flex max-w-2xl flex-col gap-5 rounded-3xl border border-line bg-surface-alt p-8 sm:p-10">
              <Quote aria-hidden="true" className="size-9 text-gold-400" strokeWidth={1.75} />
              <p lang="fr" className="font-display text-3xl leading-tight font-bold text-navy-700 sm:text-4xl">
                {site.motto}
              </p>
              <p className="text-lg leading-8 text-pretty">{letter.pending}</p>
            </div>
          )}

          <div className="reveal flex max-w-2xl flex-col gap-4 rounded-2xl border border-sky-200 bg-sky-100 p-6 lg:flex-row lg:items-center lg:gap-5">
            <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500">
              <CalendarClock className="size-6" strokeWidth={1.75} />
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="font-display text-xl leading-7 font-semibold text-navy-700">{meet.title}</h2>
              <p className="text-[15px] leading-6">{meet.text || meet.fallback}</p>
            </div>
            <ButtonLink href={href(locale, '/contact')} variant="secondary" className="shrink-0 self-start lg:self-center">
              {meet.cta}
              <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
