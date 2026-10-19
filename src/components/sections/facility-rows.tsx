import { Check, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { LightboxGroup, LightboxTrigger, type LightboxLabels } from '@/components/ui/lightbox';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type Facility = {
  /** Sert d'ancre dans la page : /facilities#labs. */
  key: string;
  title: string;
  text: string;
  features: string[];
  photo: { label: string; src?: string };
  Icon: LucideIcon;
  tone: Tone;
};

/**
 * Les espaces du collège, un par bloc : la photo passe d'un côté à l'autre d'un bloc au suivant.
 * Chaque photo s'ouvre dans la visionneuse, qui fait défiler tous les espaces avec leur description.
 */
export function FacilityRows({ items, photoWord, viewer }: { items: Facility[]; photoWord: string; viewer: LightboxLabels }) {
  return (
    <section className="py-16 sm:py-24">
      <LightboxGroup labels={viewer} photoWord={photoWord} items={items.map((item) => ({ src: item.photo.src ?? null, title: item.title, description: item.text }))}>
      <Container className="flex flex-col gap-16 sm:gap-24">
        {items.map((item, index) => {
          const look = tones[item.tone];
          const flip = index % 2 === 1;
          return (
            <article key={item.key} id={item.key} className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
              <div className={cn('group reveal relative', flip && 'md:order-last')}>
                <div aria-hidden="true" className={cn('absolute -bottom-3 size-full rounded-2xl', look.soft, flip ? '-right-3' : '-left-3')} />
                <LightboxTrigger index={index} className="overflow-hidden rounded-2xl">
                  <PhotoSlot
                    label={item.photo.label}
                    src={item.photo.src}
                    alt={item.title}
                    photoWord={photoWord}
                    ratio="aspect-16/10"
                    priority={index === 0}
                    className="transition-transform duration-500 group-hover:scale-103"
                  />
                </LightboxTrigger>
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -top-4 flex size-14 items-center justify-center rounded-2xl border-4 border-white shadow-card',
                    look.tile,
                    flip ? 'right-4' : 'left-4',
                  )}
                >
                  <item.Icon className="size-6" strokeWidth={1.75} />
                </span>
              </div>
              <div className="reveal flex flex-col gap-4">
                <p className={cn('flex items-center gap-3 font-display text-lg leading-6 font-bold', look.text)}>
                  <span aria-hidden="true" className={cn('h-0.5 w-8 rounded-full', look.bar)} />
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="font-display text-[1.7rem] leading-[1.2] font-bold text-balance text-navy-700 sm:text-4xl">{item.title}</h2>
                <p className="max-w-xl text-pretty">{item.text}</p>
                <ul className="flex flex-col gap-2.5">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 font-semibold">
                      <span aria-hidden="true" className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full', look.tile)}>
                        <Check className="size-3.5" strokeWidth={2.5} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </Container>
      </LightboxGroup>
    </section>
  );
}
