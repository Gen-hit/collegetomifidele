import { CalendarDays, GitFork, GraduationCap, Languages, Layers, Trophy, Users, type LucideIcon } from 'lucide-react';
import { levels } from '@content/levels';
import { site } from '@content/site';
import { showPlaceholders } from '@/lib/placeholders';
import { Container } from '@/components/ui/container';
import { CountUp } from '@/components/ui/count-up';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type FigureKey = keyof Dictionary['home']['stats'];

/** Années d'études de la 6e à la Terminale (premier cycle + second cycle de la section francophone générale). */
const yearsOfStudy = levels
  .filter((level) => level.section === 'francophone' && level.stream === 'general')
  .reduce((sum, level) => sum + level.classes.length, 0);

type Figure = {
  value: number | null;
  placeholder: string;
  suffix?: string;
  /** Une année s'affiche telle quelle, sans compter depuis zéro. */
  plain?: boolean;
  Icon: LucideIcon;
  tone: Tone;
};

/** Tous les chiffres disponibles. Les valeurs viennent de content/site.ts ; `null` = emplacement affiché. */
const figures: Record<FigureKey, Figure> = {
  founded: { value: site.stats.founded, placeholder: '[AAAA]', plain: true, Icon: CalendarDays, tone: 'navy' },
  students: { value: site.stats.students, placeholder: '[000]', Icon: Users, tone: 'blue' },
  teachers: { value: site.stats.teachers, placeholder: '[00]', Icon: GraduationCap, tone: 'gold' },
  success: { value: site.stats.successRate, placeholder: '[00 %]', suffix: ' %', Icon: Trophy, tone: 'green' },
  sections: { value: site.stats.sections, placeholder: '[0]', Icon: Languages, tone: 'gold' },
  // Deux faits tirés de l'offre du collège (content/levels.ts), toujours connus : ils complètent la rangée
  // tant que les chiffres officiels manquent.
  streams: { value: new Set(levels.map((level) => level.stream)).size, placeholder: '[0]', Icon: GitFork, tone: 'green' },
  years: { value: yearsOfStudy, placeholder: '[0]', Icon: Layers, tone: 'blue' },
};

/** Ordre de remplacement d'un chiffre absent : d'abord les chiffres officiels, puis ceux de l'offre. */
const fallbackOrder: FigureKey[] = ['founded', 'students', 'success', 'teachers', 'sections', 'streams', 'years'];

type KeyFiguresProps = {
  locale: Locale;
  dict: Dictionary;
  /** Les quatre chiffres à afficher, dans l'ordre. */
  keys?: FigureKey[];
  /** Sur l'accueil, les cartes chevauchent le bas de l'accroche. Ailleurs, elles forment une section normale. */
  overlap?: boolean;
};

/**
 * Chiffres clés du collège. Sur le site public, un chiffre absent est remplacé par le suivant de `fallbackOrder`
 * qui est connu : jamais de chiffre inventé, jamais de case vide.
 */
export function KeyFigures({ locale, dict, keys = ['founded', 'students', 'success', 'sections'], overlap = true }: KeyFiguresProps) {
  const known = (key: FigureKey) => figures[key].value !== null;
  const chosen = showPlaceholders
    ? keys
    : [...keys.filter(known), ...fallbackOrder.filter((key) => known(key) && !keys.includes(key))].slice(0, keys.length);
  if (chosen.length === 0) return null;
  return (
    <section className={overlap ? 'relative z-10 -mt-16 lg:-mt-20' : 'pb-16 sm:pb-24'}>
      <Container>
        <ul className={cn('grid gap-3 lg:gap-4', chosen.length === 3 ? 'grid-cols-2 sm:grid-cols-3 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1' : chosen.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2')}>
          {chosen.map((key) => {
            const { value, placeholder, suffix, plain, Icon, tone } = figures[key];
            const look = tones[tone];
            return (
              <li key={key} className="reveal relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card">
                <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', look.bar)} />
                <span aria-hidden="true" className={cn('flex size-11 items-center justify-center rounded-[10px]', look.tile)}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className={cn('font-display text-3xl leading-9 font-bold', look.text)}>
                  {value === null ? placeholder : <CountUp value={value} suffix={suffix} plain={plain} locale={locale} />}
                </p>
                <p className="text-sm leading-5 text-muted">{dict.home.stats[key]}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
