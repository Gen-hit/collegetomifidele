import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PhotoSlotProps = {
  /** Ce que la photo doit montrer, par exemple « Élèves en classe · 4:3 ». */
  label: string;
  /** Chemin de la vraie photo dans public/. Tant qu'il est absent, un emplacement s'affiche. */
  src?: string;
  /** Texte alternatif de la vraie photo. Par défaut : le début du libellé, avant « · ». */
  alt?: string;
  /** Classe de proportion Tailwind : 'aspect-4/3', 'aspect-video', 'aspect-square'… */
  ratio?: string;
  /** La première photo visible d'une page ne doit pas être chargée en différé. */
  priority?: boolean;
  className?: string;
  photoWord?: string;
};

/**
 * Photo aux dimensions réservées. Sans `src`, affiche un emplacement qui indique
 * quelle photo fournir, pour visualiser la mise en page avant d'avoir les images.
 */
export function PhotoSlot({
  label,
  src,
  alt,
  ratio = 'aspect-4/3',
  priority = false,
  className,
  photoWord = 'Photo',
}: PhotoSlotProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? label.split(' · ')[0]}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('w-full rounded-2xl object-cover', ratio, className)}
      />
    );
  }

  // Un <span> et non un <div> : l'emplacement peut ainsi se trouver dans un bouton (photo cliquable).
  return (
    <span
      className={cn(
        'flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-control',
        'bg-sky-100 p-4 text-center text-sm leading-5 text-muted',
        ratio,
        className,
      )}
    >
      <ImageIcon aria-hidden="true" className="size-6 text-blue-500" strokeWidth={1.75} />
      <span className="font-semibold">{photoWord}</span>
      <span>{label}</span>
    </span>
  );
}
