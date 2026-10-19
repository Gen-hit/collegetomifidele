import {
  BookOpen,
  Calculator,
  CalendarDays,
  ChartColumn,
  CircleQuestionMark,
  ClipboardList,
  FileText,
  History,
  Images,
  Languages,
  School,
  ScrollText,
  Send,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { NavIcon as NavIconName } from '@content/navigation';
import { cn } from '@/lib/utils';

const icons: Record<NavIconName, LucideIcon> = {
  school: School,
  history: History,
  user: UserRound,
  users: Users,
  book: BookOpen,
  languages: Languages,
  wrench: Wrench,
  chart: ChartColumn,
  sparkles: Sparkles,
  scroll: ScrollText,
  calendar: CalendarDays,
  images: Images,
  file: FileText,
  clipboard: ClipboardList,
  wallet: Wallet,
  calculator: Calculator,
  send: Send,
  help: CircleQuestionMark,
};

/** Les trois teintes alternées des pastilles d'icône. */
const tones = ['bg-sky-100 text-blue-500', 'bg-green-100 text-green-700', 'bg-gold-100 text-gold-700'] as const;

/** Pastille colorée contenant le pictogramme d'un sous-lien du menu. */
export function NavIcon({ name, index = 0, className }: { name: NavIconName; index?: number; className?: string }) {
  const Icon = icons[name];
  return (
    <span
      aria-hidden="true"
      className={cn('flex size-10 shrink-0 items-center justify-center rounded-[10px]', tones[index % tones.length], className)}
    >
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}
