import { ArrowRight, Award, BookOpen, Wrench, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/ui/section-heading';
import { tones, trackTone, type Track } from '@/lib/tones';
import { cn } from '@/lib/utils';

/** Pictogrammes des trois lignes d'une carte : enseignement général, technique, examens. */
const groupIcons: LucideIcon[] = [BookOpen, Wrench, Award];

/** Chaque section s'affiche dans sa langue d'enseignement, quelle que soit la langue du site. */
const trackLang: Record<string, string> = { francophone: 'fr', anglophone: 'en' };

export type SectionCard = {
  track: string;
  badge: string;
  title: string;
  sub: string;
  photo: { label: string; src?: string };
  groups: { label: string; value: string }[];
  link: { label: string; href: string };
};

type SectionCardsProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: SectionCard[];
  photoWord: string;
};

/** Les deux sections du collège côte à côte, avec leurs classes et leurs examens. */
export function SectionCards({ id, eyebrow, title, intro, items, photoWord }: SectionCardsProps) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} className="reveal max-w-3xl" />
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map((item) => {
            const tone = tones[trackTone[item.track as Track] ?? 'blue'];
            return (
              <li
                key={item.track}
                lang={trackLang[item.track]}
                className="group reveal flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <span aria-hidden="true" className={cn('h-1.5 w-full', tone.bar)} />
                <div className="overflow-hidden">
                  <PhotoSlot
                    label={item.photo.label}
                    src={item.photo.src}
                    photoWord={photoWord}
                    ratio="aspect-video"
                    className="rounded-none border-x-0 border-t-0 transition-transform duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-5 p-6 sm:p-8">
                  <div className="flex flex-col gap-2">
                    <span className={cn('self-start rounded-md px-2 py-1 text-xs leading-4 font-semibold tracking-[0.06em] uppercase', tone.badge)}>
                      {item.badge}
                    </span>
                    <h3 className="font-display text-[1.7rem] leading-9 font-bold text-navy-700">{item.title}</h3>
                    <p className={cn('font-semibold', tone.text)}>{item.sub}</p>
                  </div>
                  <dl className="flex flex-col divide-y divide-line border-y border-line">
                    {item.groups.map((group, index) => {
                      const Icon = groupIcons[index % groupIcons.length];
                      return (
                        <div key={group.label} className="flex items-start gap-3 py-3.5">
                          <span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-[10px]', tone.tile)}>
                            <Icon className="size-4.5" strokeWidth={1.75} />
                          </span>
                          <div className="flex flex-col">
                            <dt className="text-[13px] leading-5 font-semibold tracking-[0.06em] text-muted uppercase">{group.label}</dt>
                            <dd className="font-semibold">{group.value}</dd>
                          </div>
                        </div>
                      );
                    })}
                  </dl>
                  <Link
                    href={item.link.href}
                    className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start font-semibold text-blue-600 underline underline-offset-4"
                  >
                    {item.link.label}
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
