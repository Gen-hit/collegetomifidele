import { mainNav, type NavIcon } from '@content/navigation';
import { hiddenSections, sectionPath } from '@/features/visibility';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export type ResolvedNavChild = { key: string; label: string; desc: string; href: string; icon: NavIcon };
export type ResolvedNavItem = { key: string; label: string; href: string; children?: ResolvedNavChild[] };

type NavEntry = { label: string; desc?: string };

/** Associe la structure du menu (content/navigation.ts) aux libellés de la langue courante. */
export function resolveNav(locale: Locale, dict: Dictionary): ResolvedNavItem[] {
  const labels = dict.nav as Record<string, NavEntry>;
  // Une section que le collège n'a pas encore remplie n'a pas de lien dans le menu.
  const hidden = hiddenSections(dict);
  return mainNav.map((item) => ({
    key: item.key,
    label: labels[item.key]?.label ?? item.key,
    href: href(locale, item.path),
    children: item.children?.flatMap((child) => {
      const path = sectionPath(hidden, child.path);
      if (!path) return [];
      return [{ key: child.key, label: labels[child.key]?.label ?? child.key, desc: labels[child.key]?.desc ?? '', href: href(locale, path), icon: child.icon }];
    }),
  }));
}
