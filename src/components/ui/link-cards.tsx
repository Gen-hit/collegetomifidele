import { ArrowRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { tones, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type LinkCard = { label: string; text: string; href: string; Icon: LucideIcon; tone: Tone };

/** Rangée de cartes entièrement cliquables : « pour aller plus loin », raccourcis vers d'autres pages. */
export function LinkCards({ items, className }: { items: LinkCard[]; className?: string }) {
  return (
    <ul className={cn('grid gap-4 lg:grid-cols-3', className)}>
      {items.map(({ label, text, href, Icon, tone }) => (
        <li key={href} className="reveal">
          <Link
            href={href}
            className="group relative flex h-full items-start gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-card"
          >
            <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1 bg-transparent transition-colors', tones[tone].hoverBar)} />
            <span aria-hidden="true" className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', tones[tone].tile)}>
              <Icon className="size-6" strokeWidth={1.75} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="font-display text-lg leading-6 font-semibold text-navy-700">{label}</span>
              <span className="text-[15px] leading-6 text-muted">{text}</span>
            </span>
            <ArrowRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-blue-500 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
