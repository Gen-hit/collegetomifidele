import Link from 'next/link';
import { site } from '@content/site';
import { cn } from '@/lib/utils';

/** Logo et nom du collège, lien vers l'accueil. Le logo n'est jamais affiché à plus de 64 px de haut. */
export function Brand({ homeHref, schoolWord, className }: { homeHref: string; schoolWord: string; className?: string }) {
  return (
    <Link href={homeHref} aria-label={site.name} className={cn('flex min-h-12 items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={site.logo.src} alt="" width={42} height={48} className="h-12 w-auto" />
      <span className="flex flex-col">
        <span className="text-[11px] leading-3.5 font-semibold tracking-[0.08em] text-muted uppercase">{schoolWord}</span>
        <span className="font-display text-xl leading-6 font-bold text-navy-700">{site.name.replace(/^Collège\s+/, '')}</span>
      </span>
    </Link>
  );
}
