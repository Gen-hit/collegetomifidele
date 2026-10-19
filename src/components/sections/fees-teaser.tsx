import { ArrowRight, Calculator, CalendarDays, ClipboardList, Wallet, type LucideIcon } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { admissionHighlights } from '@/features/fees/highlights';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

const looks: { Icon: LucideIcon; tone: Tone }[] = [
  { Icon: ClipboardList, tone: 'blue' },
  { Icon: Wallet, tone: 'gold' },
  { Icon: CalendarDays, tone: 'green' },
];

/** Aperçu des frais sur la page Admissions : trois repères, puis les liens vers la grille et le simulateur. */
export function FeesTeaser({ id, locale, dict }: { id?: string; locale: Locale; dict: Dictionary }) {
  const t = dict.pages.admissions.fees;

  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} intro={t.text} accent="gold" className="reveal" />
        <ul className="grid gap-4 md:grid-cols-3">
          {admissionHighlights(locale, dict).map((card, index) => {
            const { Icon, tone } = looks[index % looks.length];
            const look = tones[tone];
            return (
              <li key={card.label} className="reveal relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-white p-6">
                <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', look.bar)} />
                <span aria-hidden="true" className={cn('flex size-11 items-center justify-center rounded-[10px]', look.tile)}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className="mt-1 text-[13px] leading-4 font-semibold tracking-[0.08em] text-muted uppercase">{card.label}</p>
                <p className="font-display text-[22px] leading-8 font-bold text-navy-700 lg:text-[26px]">{card.value}</p>
                <p className="text-sm leading-5 text-muted">{card.note}</p>
              </li>
            );
          })}
        </ul>
        <div className="reveal flex flex-wrap gap-3">
          <ButtonLink href={href(locale, '/admissions/fees')}>
            {t.primary}
            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
          </ButtonLink>
          <ButtonLink href={href(locale, '/admissions/fees#simulateur')} variant="secondary">
            <Calculator aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t.secondary}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
