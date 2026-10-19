import { CalendarDays, GraduationCap, Languages, Trophy, Users, type LucideIcon } from 'lucide-react';
import { site } from '@content/site';
import { Container } from '@/components/ui/container';
import { CountUp } from '@/components/ui/count-up';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type FigureKey = keyof Dictionary['home']['stats'];

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
};

type KeyFiguresProps = {
  locale: Locale;
  dict: Dictionary;
  /** Les quatre chiffres à afficher, dans l'ordre. */
  keys?: FigureKey[];
  /** Sur l'accueil, les cartes chevauchent le bas de l'accroche. Ailleurs, elles forment une section normale. */
  overlap?: boolean;
};

/** Chiffres clés du collège. Un chiffre absent reste un emplacement entre crochets. */
export function KeyFigures({ locale, dict, keys = ['founded', 'students', 'success', 'sections'], overlap = true }: KeyFiguresProps) {
  return (
    <section className={overlap ? 'relative z-10 -mt-16 lg:-mt-20' : 'pb-16 sm:pb-24'}>
      <Container>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
          {keys.map((key) => {
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
