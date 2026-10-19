import { Quote } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Témoignage d'un parent ou d'un ancien élève.
 * Règle du projet : ce bloc ne reçoit que des témoignages authentiques fournis par le collège.
 */
export function Testimonial({ dict }: { dict: Dictionary }) {
  const t = dict.home.testimonial;

  return (
    <section className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-8 lg:max-w-4xl">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} accent="gold" className="reveal" />
        <figure className="reveal relative flex flex-col gap-5 rounded-2xl border border-line bg-white p-8 pl-10 shadow-card">
          <span aria-hidden="true" className="absolute inset-y-6 left-0 w-1.5 rounded-r-full bg-gold-400" />
          <Quote aria-hidden="true" className="size-9 text-gold-400" strokeWidth={1.75} />
          <blockquote className="font-display text-[22px] leading-8 font-semibold text-pretty">{t.quote}</blockquote>
          <figcaption className="text-sm leading-5 text-muted">{t.author}</figcaption>
        </figure>
      </Container>
    </section>
  );
}
