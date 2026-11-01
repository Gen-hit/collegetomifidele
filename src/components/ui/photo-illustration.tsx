import {
  BookOpen,
  Building2,
  FlaskConical,
  GraduationCap,
  Hammer,
  Library,
  Monitor,
  Music,
  School,
  Shirt,
  Sparkles,
  Trophy,
  Users,
  UtensilsCrossed,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * L'image affichée sur le site public tant que le collège n'a pas fourni la photo d'un emplacement :
 * une composition originale aux couleurs du collège (formes du logo, trame de points), avec un pictogramme
 * qui rappelle le sujet attendu. Rien qui puisse passer pour une photo de l'établissement.
 */

/** Le pictogramme selon le sujet de l'emplacement (libellés français et anglais). Le premier motif trouvé l'emporte. */
const subjects: [RegExp, LucideIcon][] = [
  [/laborato|science/i, FlaskConical],
  [/informati|computer/i, Monitor],
  [/atelier|workshop|travaux pratiques|practical|poste de travail|workstation|technique|technical/i, Hammer],
  [/biblioth|library/i, Library],
  [/sport|terrain|pitch|field/i, Volleyball],
  [/cantine|canteen|infirmerie|sick bay|infirmary/i, UtensilsCrossed],
  [/tenue|uniform/i, Shirt],
  [/club|activit/i, Sparkles],
  [/musique|music|culture/i, Music],
  [/prix|remise|ceremony|cérémonie|résultat|result/i, Trophy],
  [/diplôme|graduat|examen|exam/i, GraduationCap],
  [/classe|class|cours|lesson/i, BookOpen],
  [/élève|student|pupil/i, Users],
  [/campus|façade|facade|bâtiment|building/i, Building2],
];

/** Quatre ambiances, dans l'ordre de la charte : bleu nuit, vert, or, bleu ciel. */
const palettes = [
  { bg: 'bg-navy-700', dots: 'text-sky-400 opacity-35', disc: 'bg-sky-400/25', ring: 'border-sky-400/40', block: 'bg-gold-400', icon: 'text-white' },
  { bg: 'bg-green-700', dots: 'text-green-300 opacity-40', disc: 'bg-green-300/25', ring: 'border-gold-300/50', block: 'bg-gold-400', icon: 'text-white' },
  { bg: 'bg-gold-400', dots: 'text-navy-700 opacity-20', disc: 'bg-white/35', ring: 'border-navy-700/25', block: 'bg-navy-700', icon: 'text-navy-700' },
  { bg: 'bg-sky-100', dots: 'text-blue-500 opacity-25', disc: 'bg-sky-400/30', ring: 'border-blue-500/30', block: 'bg-green-700', icon: 'text-navy-700' },
] as const;

/** Un nombre stable tiré du libellé : le même emplacement garde la même composition d'une page à l'autre. */
function seed(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

type PhotoIllustrationProps = { label: string; ratio: string; className?: string };

export function PhotoIllustration({ label, ratio, className }: PhotoIllustrationProps) {
  const subject = label.split(' · ')[0];
  const portrait = /portrait/i.test(subject);
  const n = seed(subject);
  const look = palettes[portrait ? 3 : n % palettes.length];
  const Icon = subjects.find(([rule]) => rule.test(subject))?.[1] ?? School;
  // Deux mises en page, en miroir, pour que deux images voisines ne se ressemblent pas trait pour trait.
  const mirror = (n >> 3) % 2 === 1;

  return (
    <span aria-hidden="true" className={cn('relative block w-full overflow-hidden rounded-2xl', look.bg, ratio, className)}>
      <span className={cn('dot-grid absolute inset-y-0 w-1/2', look.dots, mirror ? 'left-0' : 'right-0')} />
      <span className={cn('absolute -bottom-[22%] aspect-square w-[62%] rounded-full', look.disc, mirror ? '-left-[14%]' : '-right-[14%]')} />
      <span className={cn('absolute -top-[18%] aspect-square w-[40%] rounded-full border-[6px]', look.ring, mirror ? '-right-[10%]' : '-left-[10%]')} />
      <span className={cn('absolute top-[12%] aspect-square w-[11%] rotate-12 rounded-[28%]', look.block, mirror ? 'left-[10%]' : 'right-[10%]')} />
      <span className={cn('absolute bottom-[14%] h-[4%] w-[16%] rounded-full', look.block, mirror ? 'right-[12%]' : 'left-[12%]')} />
      {portrait ? (
        // Un portrait manquant : l'écusson du collège, plutôt qu'une silhouette anonyme.
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/brand/ctf-logo.png" alt="" className="absolute top-1/2 left-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 drop-shadow-sm" />
      ) : (
        <Icon className={cn('absolute top-1/2 left-1/2 aspect-square h-auto w-[26%] max-w-36 -translate-x-1/2 -translate-y-1/2', look.icon)} strokeWidth={1.25} />
      )}
    </span>
  );
}
