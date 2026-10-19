'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/** Bascule FR / EN en restant sur la même page. */
export function LanguageSwitcher({ locale, label, className }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname();
  const pathFor = (target: Locale) => {
    const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, '');
    return `/${target}${rest || '/'}`;
  };

  return (
    <nav aria-label={label} className={cn('flex items-center', className)}>
      {locales.map((target) => {
        const current = target === locale;
        return (
          <Link
            key={target}
            href={pathFor(target)}
            hrefLang={target}
            lang={target}
            aria-current={current ? 'true' : undefined}
            className={cn(
              'flex h-11 min-w-10 items-center justify-center rounded-lg px-1 text-sm font-semibold uppercase transition-colors',
              current
                ? 'text-navy-700 underline decoration-gold-400 decoration-2 underline-offset-6'
                : 'text-muted hover:text-navy-700',
            )}
          >
            {target}
          </Link>
        );
      })}
    </nav>
  );
}
