import { ArrowRight, Quote } from 'lucide-react';
import Link from 'next/link';
import { principal } from '@content/team';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/ui/section-heading';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

/** Mot du Principal : portrait, extrait et lien vers le message complet. Le nom et le portrait viennent de content/team.ts. */
export function PrincipalMessage({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.principal;

  return (
    <section className="py-16 sm:py-24">
      <Container className="grid items-center gap-10 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-16">
        <div className="reveal relative mx-auto w-full max-w-75 md:mx-0">
          <div aria-hidden="true" className="absolute -top-4 -left-4 size-24 rounded-2xl bg-green-700" />
          <div aria-hidden="true" className="dot-grid absolute -right-4 -bottom-4 size-24 text-gold-400" />
          <PhotoSlot
            label={t.photoLabel}
            src={principal.photo ?? undefined}
            alt={principal.name ?? undefined}
            photoWord={dict.common.photo}
            ratio="aspect-3/4"
            className="relative"
          />
        </div>
        <div className="reveal flex flex-col gap-5">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} accent="green" />
          <blockquote className="relative max-w-2xl border-l-4 border-gold-400 pl-5 text-lg leading-8 text-pretty">
            <Quote aria-hidden="true" className="mb-2 size-7 text-gold-400" strokeWidth={1.75} />
            {t.text}
          </blockquote>
          <p className="flex flex-col">
            <span className="font-semibold">{principal.name ?? t.namePlaceholder}</span>
            <span className="text-sm leading-5 text-muted">{principal.role[locale]}</span>
          </p>
          <Link
            href={href(locale, '/about/principal')}
            className="group inline-flex min-h-11 items-center gap-1.5 self-start font-semibold text-blue-600 underline underline-offset-4"
          >
            {t.link}
            <ArrowRight aria-hidden="true" className="size-4.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
