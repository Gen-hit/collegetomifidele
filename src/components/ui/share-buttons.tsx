'use client';

import { Check, Link2, Share2 } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useEffect, useState } from 'react';
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa6';
import { buttonClass } from '@/components/ui/button';
import { actionButtonClass, menuContentClass, menuItemClass } from '@/components/ui/menu';
import type { Dictionary } from '@/i18n/dictionaries';
import { useCanShare, useOrigin } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export type ShareLabels = Dictionary['common']['share'];

type ShareTarget = {
  /** Chemin de la page à partager, ancre comprise : '/fr/calendar/#evt-rentree'. */
  path: string;
  /** Texte qui accompagne le lien : le titre, la date, le nom du collège. */
  text: string;
  /** Titre proposé à la fenêtre de partage du téléphone. */
  title: string;
  labels: ShareLabels;
};

/** Les liens et actions de partage, communs à la rangée de boutons et au menu. */
function useShare({ path, text, title }: Omit<ShareTarget, 'labels'>) {
  const origin = useOrigin();
  const canShare = useCanShare();
  const [copied, setCopied] = useState(false);
  const url = `${origin}${path}`;

  // La confirmation « Lien copié » s'efface d'elle-même.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  return {
    url,
    copied,
    canShare,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    copy: async () => {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } catch {
        // Presse-papiers indisponible : rien ne se passe, les autres boutons restent utilisables.
      }
    },
    native: async () => {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Le visiteur a fermé la fenêtre de partage : ce n'est pas une erreur.
      }
    },
  };
}

/**
 * Rangée de boutons de partage, au bas d'un article : WhatsApp, Facebook, copie du lien,
 * et la fenêtre de partage du téléphone quand elle existe.
 */
export function ShareRow({ path, text, title, labels, className }: ShareTarget & { className?: string }) {
  const share = useShare({ path, text, title });
  const button = buttonClass('secondary', 'min-h-11 px-4 text-[15px]');

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <span className="font-semibold">{labels.title}</span>
      <a href={share.whatsapp} target="_blank" rel="noopener noreferrer" className={button}>
        <FaWhatsapp aria-hidden="true" className="size-4.5 text-green-700" />
        {labels.whatsapp}
      </a>
      <a href={share.facebook} target="_blank" rel="noopener noreferrer" className={button}>
        <FaFacebookF aria-hidden="true" className="size-4" />
        {labels.facebook}
      </a>
      <button type="button" onClick={share.copy} className={button}>
        {share.copied ? <Check aria-hidden="true" className="size-4.5 text-green-700" strokeWidth={2} /> : <Link2 aria-hidden="true" className="size-4.5" strokeWidth={1.75} />}
        <span aria-live="polite">{share.copied ? labels.copied : labels.copy}</span>
      </button>
      {share.canShare ? (
        <button type="button" onClick={share.native} className={button}>
          <Share2 aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
          {labels.more}
        </button>
      ) : null}
    </div>
  );
}

type ShareMenuProps = ShareTarget & {
  /** Nom accessible du bouton, quand il faut préciser ce qui est partagé : « Partager : Rentrée scolaire ». */
  ariaLabel?: string;
  /** Texte du bouton. Par défaut : « Partager ». */
  buttonLabel?: string;
  /** Apparence du bouton qui ouvre le menu. Par défaut : petit bouton à contour. */
  triggerClassName?: string;
  /** Masque le texte du bouton sur téléphone : il ne reste que le pictogramme. */
  compact?: boolean;
};

/** Bouton « Partager » qui ouvre un petit menu : WhatsApp, copie du lien, autres applications. */
export function ShareMenu({ path, text, title, labels, ariaLabel, buttonLabel, triggerClassName, compact = false }: ShareMenuProps) {
  const share = useShare({ path, text, title });

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger aria-label={ariaLabel} className={triggerClassName ?? actionButtonClass}>
        {share.copied ? <Check aria-hidden="true" className="size-4.5 shrink-0" strokeWidth={2} /> : <Share2 aria-hidden="true" className="size-4.5 shrink-0" strokeWidth={1.75} />}
        <span aria-live="polite" className={cn(compact && !share.copied && 'sr-only sm:not-sr-only')}>
          {share.copied ? labels.copied : (buttonLabel ?? labels.label)}
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} collisionPadding={12} className={menuContentClass}>
          <DropdownMenu.Item asChild className={menuItemClass}>
            <a href={share.whatsapp} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp aria-hidden="true" className="size-5 shrink-0 text-green-700" />
              {labels.whatsapp}
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={menuItemClass}>
            <a href={share.facebook} target="_blank" rel="noopener noreferrer">
              <FaFacebookF aria-hidden="true" className="size-5 shrink-0 text-blue-600" />
              {labels.facebook}
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={share.copy} className={menuItemClass}>
            <Link2 aria-hidden="true" className="size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
            {labels.copy}
          </DropdownMenu.Item>
          {share.canShare ? (
            <DropdownMenu.Item onSelect={share.native} className={menuItemClass}>
              <Share2 aria-hidden="true" className="size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
              {labels.more}
            </DropdownMenu.Item>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
