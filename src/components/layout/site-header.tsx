import { ButtonLink } from '@/components/ui/button';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { Brand } from './brand';
import { LanguageSwitcher } from './language-switcher';
import { MainNav } from './main-nav';
import { MobileMenu } from './mobile-menu';
import { resolveNav } from './nav-data';
import { SocialLinks } from './social-links';

/** En-tête fixe : logo, menu à sous-liens, langues, bouton de préinscription, menu mobile. */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = resolveNav(locale, dict);
  const homeHref = href(locale);
  const enrollHref = href(locale, '/admissions#preinscription');
  const brand = <Brand homeHref={homeHref} schoolWord={dict.common.school} />;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {brand}
        <MainNav items={items} label={dict.common.menuTitle} />
        <div className="flex items-center gap-1">
          <LanguageSwitcher locale={locale} label={dict.common.language} />
          <ButtonLink href={enrollHref} className="ml-2 hidden min-h-11 px-5 text-[15px] xl:inline-flex">
            {dict.common.preinscription}
          </ButtonLink>
          <MobileMenu
            items={items}
            homeHref={homeHref}
            enrollHref={enrollHref}
            brand={brand}
            labels={{
              open: dict.common.openMenu,
              close: dict.common.closeMenu,
              title: dict.common.menuTitle,
              home: dict.common.home,
              enroll: dict.common.enroll,
              overview: dict.common.overview,
            }}
            footer={<SocialLinks labels={dict.footer.social} tone="light" className="justify-center" />}
          />
        </div>
      </div>
    </header>
  );
}
