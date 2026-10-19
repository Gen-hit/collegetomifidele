/**
 * Les teintes du site, réunies ici pour que chaque composant emploie les mêmes associations.
 * Code couleur des parcours : francophone = bleu, anglophone = vert, technique = doré.
 * Les classes sont écrites en entier pour que Tailwind les détecte.
 */
export type Tone = 'blue' | 'green' | 'gold' | 'navy';

export const tones: Record<
  Tone,
  {
    /** Texte coloré sur fond clair. */
    text: string;
    /** Pastille de pictogramme. */
    tile: string;
    /** Badge ou étiquette. */
    badge: string;
    /** Filet plein. */
    bar: string;
    /** Filet qui apparaît au survol d'une carte (la carte porte la classe `group`). */
    hoverBar: string;
    /** Fond teinté d'un bloc. */
    soft: string;
    /** Contour assorti au fond teinté. */
    border: string;
    /** Texte et filet colorés sur fond sombre. */
    onDark: string;
    onDarkBar: string;
  }
> = {
  blue: {
    text: 'text-blue-600',
    tile: 'bg-sky-100 text-blue-500',
    badge: 'bg-sky-100 text-blue-600',
    bar: 'bg-blue-500',
    hoverBar: 'group-hover:bg-sky-400',
    soft: 'bg-sky-100',
    border: 'border-sky-200',
    onDark: 'text-sky-400',
    onDarkBar: 'bg-sky-400',
  },
  green: {
    text: 'text-green-700',
    tile: 'bg-green-100 text-green-700',
    badge: 'bg-green-100 text-green-700',
    bar: 'bg-green-700',
    hoverBar: 'group-hover:bg-green-700',
    soft: 'bg-green-100',
    border: 'border-green-300',
    onDark: 'text-green-300',
    onDarkBar: 'bg-green-300',
  },
  gold: {
    text: 'text-gold-700',
    tile: 'bg-gold-100 text-gold-700',
    badge: 'bg-gold-100 text-gold-700',
    bar: 'bg-gold-400',
    hoverBar: 'group-hover:bg-gold-400',
    soft: 'bg-gold-100',
    border: 'border-gold-300',
    onDark: 'text-gold-400',
    onDarkBar: 'bg-gold-400',
  },
  navy: {
    text: 'text-navy-700',
    tile: 'bg-sky-100 text-navy-700',
    badge: 'bg-sky-100 text-navy-700',
    bar: 'bg-navy-700',
    hoverBar: 'group-hover:bg-navy-700',
    soft: 'bg-surface-alt',
    border: 'border-line',
    onDark: 'text-white',
    onDarkBar: 'bg-white',
  },
};

/** La teinte de chaque parcours. */
export const trackTone = { francophone: 'blue', anglophone: 'green', technique: 'gold' } as const satisfies Record<string, Tone>;
export type Track = keyof typeof trackTone;

/** Fait tourner les teintes sur une liste : 1er élément bleu, 2e doré, 3e vert, 4e bleu marine… */
export const toneCycle: Tone[] = ['blue', 'gold', 'green', 'navy'];
