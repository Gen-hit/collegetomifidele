import { HeartHandshake, Languages, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { FeatureCards } from '@/components/ui/feature-cards';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Dictionary } from '@/i18n/dictionaries';
import type { Tone } from '@/lib/tones';

const looks: { Icon: LucideIcon; tone: Tone }[] = [
  { Icon: Languages, tone: 'blue' },
  { Icon: Wrench, tone: 'gold' },
  { Icon: ShieldCheck, tone: 'green' },
  { Icon: HeartHandshake, tone: 'navy' },
];

/** Les atouts du collège, en quatre cartes à pictogramme coloré. */
export function Strengths({ dict }: { dict: Dictionary }) {
  const t = dict.home.strengths;

  return (
    <section className="bg-surface-alt py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} accent="gold" className="reveal" />
        <FeatureCards items={t.items.map((item, index) => ({ ...item, ...looks[index % looks.length] }))} />
      </Container>
    </section>
  );
}
