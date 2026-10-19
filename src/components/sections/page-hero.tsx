import type { ReactNode } from 'react';
import { Breadcrumb, type Crumb } from '@/components/ui/breadcrumb';
import { Chip } from '@/components/ui/chip';
import { Container } from '@/components/ui/container';
import { RichTitle, type Highlight } from '@/components/ui/section-heading';
import type { Locale } from '@/i18n/config';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

const highlights: Record<Tone, Highlight> = {
  blue: 'skyOnDark',
  green: 'greenOnDark',
  gold: 'goldOnDark',
  navy: 'skyOnDark',
};

/** Le bloc de couleur qui signe le bandeau : bleu ciel, vert ou doré selon la page. */
const blocks: Record<Tone, string> = {
  blue: 'bg-sky-400',
  green: 'bg-green-700',
  gold: 'bg-gold-400',
  navy: 'bg-sky-400',
};

type PageHeroProps = {
  eyebrow: string;
  /** Les mots entre accolades prennent la couleur de la page : "Section {francophone}". */
  title: string;
  intro?: string;
  /** Couleur de la page : bleu (francophone), vert (anglophone), doré (technique et pages générales). */
  tone?: Tone;
  /** Étiquettes sous l'introduction : niveaux, filières. */
  chips?: string[];
  /** Fil d'Ariane : fournir la langue, les libellés et le chemin jusqu'à la page courante. */
  breadcrumb?: { locale: Locale; items: Crumb[]; homeLabel: string; label: string };
  /** Langue du titre s'il diffère de celle de la page (« Anglophone section » sur le site français). */
  titleLang?: string;
  children?: ReactNode;
};

/** Bandeau de titre sombre des pages intérieures, avec fil d'Ariane et décor à la couleur de la page. */
export function PageHero({ eyebrow, title, intro, tone = 'gold', chips, breadcrumb, titleLang, children }: PageHeroProps) {
  return (
    <section className="on-dark relative overflow-hidden bg-indigo-900 pt-6 pb-14 text-white sm:pt-8 sm:pb-20">
      {/* Décor : grille de points, disque et bloc de couleur. Sous 1 024 px, ils restent dans la marge basse, sous le texte. */}
      <div aria-hidden="true" className="dot-grid absolute top-0 right-0 h-full w-72 text-sky-400 opacity-20" />
      <div aria-hidden="true" className="absolute -right-12 -bottom-20 size-32 rounded-full bg-navy-700 sm:-right-10 sm:-bottom-28 sm:size-48 lg:-bottom-16 lg:size-64" />
      <div
        aria-hidden="true"
        className={cn('absolute right-24 -bottom-8 hidden size-24 animate-float rounded-2xl md:block lg:right-40 lg:size-28', blocks[tone])}
      />
      <div aria-hidden="true" className={cn('absolute inset-x-0 bottom-0 h-1', tones[tone].onDarkBar)} />

      <Container className="relative flex flex-col gap-3">
        {breadcrumb ? <Breadcrumb {...breadcrumb} /> : null}
        <p
          className={cn(
            'flex animate-rise items-center gap-3 text-[13px] leading-4 font-semibold tracking-[0.08em] text-sky-400 uppercase',
            breadcrumb ? 'mt-4 sm:mt-6' : 'mt-8 sm:mt-12',
          )}
        >
          <span aria-hidden="true" className={cn('h-0.5 w-8 rounded-full', tones[tone].onDarkBar)} />
          {eyebrow}
        </p>
        <h1
          lang={titleLang}
          className="max-w-3xl animate-rise font-display text-4xl leading-[1.15] font-bold text-balance [animation-delay:80ms] sm:text-5xl"
        >
          <RichTitle text={title} highlight={highlights[tone]} />
        </h1>
        {intro ? <p className="max-w-2xl animate-rise text-lg leading-8 text-pretty [animation-delay:160ms]">{intro}</p> : null}
        {chips && chips.length > 0 ? (
          <ul className="mt-1 flex animate-rise flex-wrap gap-2 [animation-delay:220ms]">
            {chips.map((chip) => (
              <li key={chip}>
                <Chip onDark>{chip}</Chip>
              </li>
            ))}
          </ul>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
