import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-6 text-base font-semibold ' +
  'transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-98';

const variants = {
  /** Action principale sur fond clair. */
  primary: 'bg-navy-700 text-white shadow-card hover:bg-indigo-900',
  /** Action secondaire sur fond clair. */
  secondary: 'border-[1.5px] border-blue-600 bg-white text-blue-600 hover:bg-sky-100',
  /** Appel à l'action chaud, surtout sur fond sombre. */
  gold: 'bg-gold-400 text-ink shadow-card hover:bg-gold-300',
  /** Action secondaire sur fond sombre. */
  ghost: 'border-[1.5px] border-white text-white hover:bg-white hover:text-navy-700',
  /** Lien vers WhatsApp. */
  whatsapp: 'bg-green-700 text-white shadow-card hover:bg-green-800',
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClass(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(base, variants[variant], className);
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<'a'>, 'href' | 'className' | 'children'>;

/** Lien stylé en bouton. Les adresses externes s'ouvrent sans passer par le routeur. */
export function ButtonLink({ href, variant = 'primary', className, children, ...rest }: ButtonLinkProps) {
  const classes = buttonClass(variant, className);
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
