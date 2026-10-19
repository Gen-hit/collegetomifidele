'use client';

import { ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Accordion, Dialog } from 'radix-ui';
import { useState, type ReactNode } from 'react';
import { buttonClass } from '@/components/ui/button';
import type { ResolvedNavItem } from './nav-data';
import { NavIcon } from './nav-icon';

type MobileMenuProps = {
  items: ResolvedNavItem[];
  labels: { open: string; close: string; title: string; home: string; enroll: string; overview: string };
  homeHref: string;
  enrollHref: string;
  /** Logo et sélecteur de langue, rendus côté serveur et réutilisés dans le panneau. */
  brand: ReactNode;
  footer: ReactNode;
};

/** Menu plein écran pour téléphone et tablette : rubriques dépliables (Radix Dialog + Accordion). */
export function MobileMenu({ items, labels, homeHref, enrollHref, brand, footer }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const rowClass = 'flex min-h-13 w-full items-center justify-between gap-3 py-3 text-left text-[17px] font-semibold text-ink';

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={labels.open}
        className="flex size-11 items-center justify-center rounded-[10px] border border-control bg-white text-navy-700 transition-colors hover:bg-surface-alt xl:hidden"
      >
        <Menu aria-hidden="true" className="size-5.5" strokeWidth={1.75} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-white data-[state=open]:animate-pop xl:hidden"
        >
          <div className="flex h-18 shrink-0 items-center justify-between gap-4 border-b border-line px-4 sm:px-6">
            <div onClick={close}>{brand}</div>
            <Dialog.Title className="sr-only">{labels.title}</Dialog.Title>
            <Dialog.Close
              aria-label={labels.close}
              className="flex size-11 items-center justify-center rounded-[10px] border border-control bg-white text-navy-700 transition-colors hover:bg-surface-alt"
            >
              <X aria-hidden="true" className="size-5.5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>

          <nav aria-label={labels.title} className="flex-1 overflow-y-auto px-4 py-2 sm:px-6">
            <Link href={homeHref} onClick={close} className={`${rowClass} border-b border-line`}>
              {labels.home}
            </Link>
            <Accordion.Root type="single" collapsible>
              {items.map((item) =>
                item.children ? (
                  <Accordion.Item key={item.key} value={item.key} className="border-b border-line">
                    <Accordion.Header>
                      <Accordion.Trigger className={`${rowClass} group`}>
                        {item.label}
                        <ChevronDown
                          aria-hidden="true"
                          className="size-5 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
                          strokeWidth={2}
                        />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pb-3">
                      <ul className="flex flex-col gap-1">
                        <li>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="flex min-h-11 items-center rounded-xl px-3 font-semibold text-blue-600 underline underline-offset-4"
                          >
                            {labels.overview}
                          </Link>
                        </li>
                        {item.children.map((child, index) => (
                          <li key={child.key}>
                            <Link
                              href={child.href}
                              onClick={close}
                              className="flex min-h-13 items-center gap-3 rounded-xl px-3 py-1.5 transition-colors hover:bg-surface-alt"
                            >
                              <NavIcon name={child.icon} index={index} className="size-9" />
                              <span className="font-semibold text-ink">{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Accordion.Content>
                  </Accordion.Item>
                ) : (
                  <Link key={item.key} href={item.href} onClick={close} className={`${rowClass} border-b border-line`}>
                    {item.label}
                  </Link>
                ),
              )}
            </Accordion.Root>
          </nav>

          <div className="flex shrink-0 flex-col gap-3 border-t border-line p-4 sm:px-6">
            <Link href={enrollHref} onClick={close} className={buttonClass('primary', 'w-full')}>
              {labels.enroll}
            </Link>
            {footer}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
