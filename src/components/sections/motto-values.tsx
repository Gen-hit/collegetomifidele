import { BookOpenCheck, ShieldCheck, Trophy, type LucideIcon } from 'lucide-react';
import { site } from '@content/site';
import { Container } from '@/components/ui/container';
import { FeatureCards } from '@/components/ui/feature-cards';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/** Une couleur et un pictogramme par mot de la devise : Discipline, Travail, Succès. */
const looks: { Icon: LucideIcon; tone: Tone; word: string }[] = [
  { Icon: ShieldCheck, tone: 'blue', word: 'text-sky-400' },
  { Icon: BookOpenCheck, tone: 'gold', word: 'text-gold-400' },
  { Icon: Trophy, tone: 'green', word: 'text-green-300' },
];

type MottoValuesProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: { title: string; text: string }[];
};

/** Mission et valeurs : la devise du logo en grand, puis une carte par valeur. */
export function MottoValues({ id, eyebrow, title, intro, items }: MottoValuesProps) {
  // La devise officielle reste en français, comme sur le logo.
  const words = site.motto.split(' · ');

  return (
    <section id={id} className="py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} className="reveal" />
        <p
          lang="fr"
          className="on-dark reveal relative flex flex-col gap-x-8 gap-y-1 overflow-hidden rounded-3xl bg-indigo-900 px-6 py-8 font-display text-4xl leading-tight font-bold sm:flex-row sm:items-center sm:justify-center sm:px-10 sm:py-10 sm:text-5xl lg:text-6xl"
        >
          <span aria-hidden="true" className="dot-grid absolute inset-y-0 right-0 w-40 text-sky-400 opacity-20" />
          {words.map((word, index) => (
            <span key={word} className={cn('relative', looks[index % looks.length].word)}>
              {word}
            </span>
          ))}
        </p>
        <FeatureCards columns={3} numbered items={items.map((item, index) => ({ ...item, ...looks[index % looks.length] }))} />
      </Container>
    </section>
  );
}
