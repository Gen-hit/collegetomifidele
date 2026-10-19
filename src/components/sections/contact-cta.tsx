import { ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { CtaBand } from '@/components/sections/cta-band';
import { ButtonLink } from '@/components/ui/button';
import { href, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { whatsappLink } from '@/lib/links';

/** Dernier appel à l'action de l'accueil : contacter le secrétariat. */
export function ContactCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.cta;

  return (
    <CtaBand title={t.title} text={t.text} flushTop>
      <ButtonLink href={href(locale, '/contact')}>
        {t.primary}
        <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2} />
      </ButtonLink>
      <ButtonLink href={whatsappLink(locale, dict.help.whatsappMessage)} variant="whatsapp">
        <FaWhatsapp aria-hidden="true" className="size-5" />
        {t.secondary}
      </ButtonLink>
    </CtaBand>
  );
}
