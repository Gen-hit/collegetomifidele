import { CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { LightboxGroup, LightboxTrigger, type LightboxLabels } from '@/components/ui/lightbox';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { accentOf, SectionHeading } from '@/components/ui/section-heading';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/** Les deux formes de couleur posées derrière la photo. */
const shapes: Record<Tone, { block: string; dots: string }> = {
  blue: { block: 'bg-sky-400', dots: 'text-gold-400' },
  green: { block: 'bg-green-700', dots: 'text-gold-400' },
  gold: { block: 'bg-gold-400', dots: 'text-navy-700' },
  navy: { block: 'bg-navy-700', dots: 'text-sky-400' },
};

type IntroSplitProps = {
  id?: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  /** Points clés, affichés avec une coche. */
  points?: string[];
  photo: { label: string; src?: string; word: string; ratio?: string };
  /** Libellés de la visionneuse (dict.viewer) : la photo devient cliquable et s'agrandit. */
  viewer?: LightboxLabels;
  tone?: Tone;
  /** Place la photo à gauche sur grand écran. */
  flip?: boolean;
  /** Fond gris clair, pour alterner avec les sections blanches. */
  alt?: boolean;
  children?: ReactNode;
};

/** Présentation en deux colonnes : texte d'un côté, photo sur un décor de couleur de l'autre. */
export function IntroSplit({ id, eyebrow, title, paragraphs, points, photo, viewer, tone = 'blue', flip = false, alt = false, children }: IntroSplitProps) {
  const shape = shapes[tone];
  const caption = photo.label.split(' · ')[0];
  const picture = (
    <PhotoSlot
      label={photo.label}
      src={photo.src}
      photoWord={photo.word}
      ratio={photo.ratio}
      className="relative border-solid border-white shadow-card ring-1 ring-line"
    />
  );

  return (
    <section id={id} className={cn('py-16 sm:py-24', alt && 'bg-surface-alt')}>
      <Container className="grid items-center gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
        <div className="reveal flex flex-col gap-5">
          <SectionHeading eyebrow={eyebrow} title={title} accent={accentOf(tone)} />
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-xl text-pretty">
              {paragraph}
            </p>
          ))}
          {points && points.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 font-semibold">
                  <CircleCheck aria-hidden="true" className={cn('mt-0.5 size-5 shrink-0', tones[tone].text)} strokeWidth={2} />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          {children}
        </div>
        <div className={cn('reveal relative mx-3 sm:mx-5 md:mx-3 lg:mx-5', flip && 'md:order-first')}>
          <div aria-hidden="true" className={cn('absolute -top-4 size-24 rounded-2xl', shape.block, flip ? '-left-4' : '-right-4')} />
          <div aria-hidden="true" className={cn('dot-grid absolute -bottom-5 h-24 w-32', shape.dots, flip ? '-right-5' : '-left-5')} />
          {viewer ? (
            <LightboxGroup labels={viewer} photoWord={photo.word} items={[{ src: photo.src ?? null, title: caption, description: paragraphs[0] }]}>
              <LightboxTrigger index={0} className="rounded-2xl">
                {picture}
              </LightboxTrigger>
            </LightboxGroup>
          ) : (
            picture
          )}
        </div>
      </Container>
    </section>
  );
}
