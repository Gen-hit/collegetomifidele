import { ArrowRight, CalendarDays, ClipboardList, Wallet, type LucideIcon } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { admissionHighlights, schoolYear } from '@/features/fees/highlights';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';

const icons: LucideIcon[] = [ClipboardList, Wallet, CalendarDays];

/**
 * Bandeau sombre des admissions sur l'accueil : frais, prochain concours et accès à la préinscription.
 * Les montants et les dates viennent de content/fees.ts et content/admissions.ts.
 */
export function AdmissionsBand({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.admissions;

  return (
    <section className="on-dark relative overflow-hidden bg-indigo-900 py-16 text-white sm:py-24">
      <div aria-hidden="true" className="dot-grid absolute -top-6 right-0 h-48 w-72 text-sky-400 opacity-25" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-16 size-56 rounded-full bg-navy-700" />
      <Container className="relative flex flex-col gap-10">
        <SectionHeading
          eyebrow={fill(t.eyebrow, { year: schoolYear(dict) })}
          title={t.title}
          intro={t.text}
          accent="gold"
          tone="dark"
          className="reveal"
        />
        <ul className="grid gap-4 md:grid-cols-3">
          {admissionHighlights(locale, dict).map((card, index) => {
            const Icon = icons[index % icons.length];
            return (
              <li
                key={card.label}
                className="reveal flex flex-col gap-2 rounded-2xl border border-white/20 bg-indigo-950/60 p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-400"
              >
                <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-[10px] bg-gold-400 text-ink">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className="mt-1 text-[13px] leading-4 font-semibold tracking-[0.08em] text-sky-400 uppercase">{card.label}</p>
                <p className="font-display text-[22px] leading-8 font-bold text-gold-400 lg:text-[26px]">{card.value}</p>
                <p className="text-sm leading-5">{card.note}</p>
              </li>
            );
          })}
        </ul>
        <div className="reveal flex flex-wrap gap-3">
          <ButtonLink href={href(locale, '/admissions#preinscription')} variant="gold">
            {t.primary}
            <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
          </ButtonLink>
          <ButtonLink href={href(locale, '/admissions/fees')} variant="ghost">
            {t.secondary}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
