import { CalendarCheck, DoorOpen, Globe, GraduationCap, PartyPopper, PencilLine, TreePalm, Users, type LucideIcon } from 'lucide-react';
import type { CalendarCategory } from '@content/calendar';

/** Le pictogramme de chaque catégorie. Sa couleur vient de `categoryTone` (dates.ts). */
export const categoryIcon: Record<CalendarCategory, LucideIcon> = {
  term: CalendarCheck,
  evaluation: PencilLine,
  exam: GraduationCap,
  holiday: TreePalm,
  international: Globe,
  openDay: DoorOpen,
  culture: PartyPopper,
  meeting: Users,
};
