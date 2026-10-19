import { Container } from '@/components/ui/container';
import { LightboxGroup, LightboxTrigger, type LightboxLabels } from '@/components/ui/lightbox';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { accentOf, SectionHeading } from '@/components/ui/section-heading';
import type { Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

type PhotoStripProps = {
  id?: string;
  eyebrow: string;
  title: string;
  /** Trois photos : la première occupe toute la largeur sur téléphone. */
  photos: { label: string; src?: string }[];
  photoWord: string;
  /** Libellés de la visionneuse (dict.viewer). */
  viewer: LightboxLabels;
  tone?: Tone;
  alt?: boolean;
};

/** Rangée de trois photos légendées, qui s'ouvrent dans la visionneuse. */
export function PhotoStrip({ id, eyebrow, title, photos, photoWord, viewer, tone = 'blue', alt = false }: PhotoStripProps) {
  return (
    <section id={id} className={cn('py-16 sm:py-24', alt && 'bg-surface-alt')}>
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={eyebrow} title={title} accent={accentOf(tone)} className="reveal" />
        <LightboxGroup labels={viewer} photoWord={photoWord} items={photos.map((item) => ({ src: item.src ?? null, title: item.label }))}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {photos.map((item, index) => (
              <li key={item.label} className={cn('group reveal', index === 0 && 'col-span-2 sm:col-span-1')}>
                <LightboxTrigger index={index} className="overflow-hidden rounded-2xl">
                  <PhotoSlot
                    label={`${item.label} · 4:3`}
                    src={item.src}
                    alt={item.label}
                    photoWord={photoWord}
                    ratio={index === 0 ? 'aspect-video sm:aspect-4/3' : 'aspect-4/3'}
                    className="transition-transform duration-500 group-hover:scale-103"
                  />
                </LightboxTrigger>
              </li>
            ))}
          </ul>
        </LightboxGroup>
      </Container>
    </section>
  );
}
