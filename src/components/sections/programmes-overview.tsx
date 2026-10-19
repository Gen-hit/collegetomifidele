import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { photo } from '@content/photos';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/ui/section-heading';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';

/** Code couleur des parcours : francophone en bleu, anglophone en vert, technique en doré. */
const tracks = [
  { key: 'francophone', path: '/programmes/francophone', lang: 'fr', bar: 'bg-blue-500', badge: 'bg-sky-100 text-blue-600', levels: 'text-blue-600' },
  { key: 'anglophone', path: '/programmes/anglophone', lang: 'en', bar: 'bg-green-700', badge: 'bg-green-100 text-green-700', levels: 'text-green-700' },
  { key: 'technique', path: '/programmes/technique', lang: undefined, bar: 'bg-gold-400', badge: 'bg-gold-100 text-gold-700', levels: 'text-gold-700' },
] as const;

/** Les trois parcours du collège, chacun avec sa couleur. */
export function ProgrammesOverview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.programmes;

  return (
    <section className="py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} intro={t.intro} className="reveal" />
        <ul className="grid gap-6 md:grid-cols-3">
          {t.items.map((item, index) => {
            const track = tracks[index % tracks.length];
            return (
              <li
                key={item.title}
                lang={track.lang}
                className="group reveal flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <span aria-hidden="true" className={cn('h-1.5 w-full', track.bar)} />
                <PhotoSlot
                  label={item.photo}
                  src={photo(`home.programmes.${track.key}`)}
                  photoWord={dict.common.photo}
                  ratio="aspect-16/10"
                  className="rounded-none border-x-0 border-t-0"
                />
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span
                    className={cn(
                      'self-start rounded-md px-2 py-1 text-xs leading-4 font-semibold tracking-[0.06em] uppercase',
                      track.badge,
                    )}
                  >
                    {item.track}
                  </span>
                  <h3 className="font-display text-[22px] leading-7 font-semibold">{item.title}</h3>
                  <p className={cn('text-sm leading-5 font-semibold', track.levels)}>{item.levels}</p>
                  <p className="text-[15px] leading-6 text-muted">{item.text}</p>
                  <Link
                    href={href(locale, track.path)}
                    className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start font-semibold text-blue-600 underline underline-offset-4"
                  >
                    {item.link}
                    <ArrowRight aria-hidden="true" className="size-4.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
