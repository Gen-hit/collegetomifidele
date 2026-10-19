import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from 'react-icons/fa6';
import { site } from '@content/site';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';

const networks = [
  { key: 'facebook', Icon: FaFacebookF },
  { key: 'instagram', Icon: FaInstagram },
  { key: 'youtube', Icon: FaYoutube },
  { key: 'tiktok', Icon: FaTiktok },
  { key: 'whatsappChannel', Icon: FaWhatsapp },
] as const;

type SocialLinksProps = {
  labels: Dictionary['footer']['social'];
  /** 'dark' pour le pied de page, 'light' pour le menu mobile. */
  tone?: 'dark' | 'light';
  className?: string;
};

/**
 * Icônes des réseaux sociaux du collège.
 * Les liens se renseignent dans content/site.ts (`social`) ; tant qu'un lien vaut `null`,
 * l'icône reste affichée mais ne mène nulle part.
 */
export function SocialLinks({ labels, tone = 'dark', className }: SocialLinksProps) {
  const style =
    tone === 'dark'
      ? 'border-white/25 text-white hover:border-gold-400 hover:bg-gold-400 hover:text-ink'
      : 'border-line text-navy-700 hover:border-navy-700 hover:bg-navy-700 hover:text-white';

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {networks.map(({ key, Icon }) => {
        const url = site.social[key];
        return (
          <li key={key}>
            <a
              href={url ?? '#'}
              aria-label={labels[key]}
              title={labels[key]}
              {...(url ? { target: '_blank', rel: 'noopener noreferrer' } : { 'data-link-missing': '' })}
              className={cn(
                'flex size-11 items-center justify-center rounded-full border transition duration-200 hover:-translate-y-0.5',
                style,
              )}
            >
              <Icon aria-hidden="true" className="size-4.5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
