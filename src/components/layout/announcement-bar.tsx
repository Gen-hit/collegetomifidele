'use client';

import { ArrowRight, Megaphone, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ctf-announcement-dismissed';

type AnnouncementBarProps = { text: string; cta: string; href: string; dismissLabel: string };

/**
 * Bandeau d'annonce en haut du site (inscriptions, rentrée, communiqué urgent).
 * Le visiteur peut le fermer ; il réapparaît à sa prochaine visite.
 */
export function AnnouncementBar({ text, cta, href, dismissLabel }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === text) setVisible(false);
    } catch {
      // Stockage indisponible (navigation privée) : le bandeau reste affiché.
    }
  }, [text]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, text);
    } catch {
      // Sans stockage, le bandeau reviendra simplement à la page suivante.
    }
  };

  return (
    <div className="bg-gold-400 text-ink">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-1 sm:px-6 lg:px-8">
        <Megaphone aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
        <p className="flex-1 text-sm leading-5 font-semibold sm:text-[15px] sm:leading-6">
          <Link href={href} className="group inline-flex min-h-11 items-center gap-x-3 gap-y-0.5 py-1.5">
            <span>{text}</span>
            <span className="hidden underline underline-offset-4 group-hover:no-underline sm:inline">{cta}</span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={dismissLabel}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-gold-300"
        >
          <X aria-hidden="true" className="size-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
