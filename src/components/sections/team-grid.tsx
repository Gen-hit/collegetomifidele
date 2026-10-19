import type { Person } from '@content/team';
import { Container } from '@/components/ui/container';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Locale } from '@/i18n/config';
import { toneCycle, tones } from '@/lib/tones';
import { cn } from '@/lib/utils';

type TeamGridProps = {
  id?: string;
  locale: Locale;
  eyebrow: string;
  title: string;
  people: Person[];
  labels: { namePlaceholder: string; photo: string; photoWord: string };
};

/** Trombinoscope de l'équipe de direction. Les personnes viennent de content/team.ts. */
export function TeamGrid({ id, locale, eyebrow, title, people, labels }: TeamGridProps) {
  return (
    <section id={id} className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={eyebrow} title={title} accent="green" className="reveal" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-6">
          {people.map((person, index) => {
            const tone = tones[toneCycle[index % toneCycle.length]];
            return (
              <li key={`${person.role.fr}-${index}`} className="group reveal flex flex-col gap-3">
                <div className="relative">
                  <div aria-hidden="true" className={cn('absolute -right-1.5 -bottom-1.5 size-full rounded-2xl transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1', tone.bar)} />
                  <PhotoSlot
                    label={labels.photo}
                    src={person.photo ?? undefined}
                    alt={person.name ?? ''}
                    photoWord={labels.photoWord}
                    ratio="aspect-square"
                    className="relative bg-white"
                  />
                </div>
                <p className="flex flex-col pt-1">
                  <span className="font-display text-lg leading-6 font-semibold">{person.name ?? labels.namePlaceholder}</span>
                  <span className={cn('text-sm leading-5 font-semibold', tone.text)}>{person.role[locale]}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
