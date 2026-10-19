'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationMenu } from 'radix-ui';
import { cn } from '@/lib/utils';
import type { ResolvedNavItem } from './nav-data';
import { NavIcon } from './nav-icon';

const linkClass =
  'relative flex h-11 items-center gap-1 rounded-lg px-3 text-[15px] font-semibold text-ink transition-colors ' +
  'hover:bg-surface-alt hover:text-navy-700 data-[state=open]:bg-surface-alt data-[state=open]:text-navy-700';

/** Filet doré sous la rubrique de la page courante. */
function ActiveMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-gold-400 transition-transform duration-300',
        active ? 'scale-x-100' : 'scale-x-0',
      )}
    />
  );
}

/** Menu principal sur grand écran, avec sous-liens déroulants (Radix NavigationMenu). */
export function MainNav({ items, label }: { items: ResolvedNavItem[]; label: string }) {
  const pathname = usePathname();
  const isActive = (item: ResolvedNavItem) => pathname.startsWith(item.href);

  return (
    <NavigationMenu.Root aria-label={label} delayDuration={80} className="relative hidden xl:block">
      <NavigationMenu.List className="flex items-center gap-0.5">
        {items.map((item, itemIndex) => {
          const active = isActive(item);
          if (!item.children) {
            return (
              <NavigationMenu.Item key={item.key}>
                <NavigationMenu.Link asChild active={active}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                    <ActiveMark active={active} />
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            );
          }

          // Les derniers menus s'alignent à droite pour ne pas sortir de l'écran.
          const alignRight = itemIndex >= items.length - 3;
          return (
            <NavigationMenu.Item key={item.key} className="relative">
              <NavigationMenu.Trigger className={cn(linkClass, 'group')}>
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
                  strokeWidth={2}
                />
                <ActiveMark active={active} />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content
                className={cn(
                  'absolute top-full z-50 mt-2 w-136 rounded-2xl border border-line bg-white p-3 shadow-float',
                  'data-[state=open]:animate-pop',
                  alignRight ? 'right-0' : 'left-0',
                )}
              >
                <ul className="grid grid-cols-2 gap-1">
                  {item.children.map((child, index) => (
                    <li key={child.key}>
                      <NavigationMenu.Link asChild>
                        <Link
                          href={child.href}
                          className="group/link flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface-alt"
                        >
                          <NavIcon name={child.icon} index={index} />
                          <span className="flex flex-col">
                            <span className="font-semibold text-ink group-hover/link:text-navy-700">{child.label}</span>
                            <span className="text-sm leading-5 text-muted">{child.desc}</span>
                          </span>
                        </Link>
                      </NavigationMenu.Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
