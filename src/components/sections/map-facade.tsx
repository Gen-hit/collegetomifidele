'use client';

import { Map, MapPin } from 'lucide-react';
import { useState } from 'react';
import { buttonClass } from '@/components/ui/button';

type MapFacadeProps = { embedUrl: string; title: string; loadLabel: string; note: string };

/**
 * Carte Google Maps chargée seulement quand le visiteur la demande.
 * Une carte intégrée pèse lourd : sur une connexion 3G, on ne la télécharge pas sans raison.
 */
export function MapFacade({ embedUrl, title, loadLabel, note }: MapFacadeProps) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="aspect-4/3 w-full rounded-2xl border border-line lg:aspect-16/11"
      />
    );
  }

  return (
    <div className="relative flex aspect-4/3 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-line bg-sky-100 p-6 text-center lg:aspect-16/11">
      <div aria-hidden="true" className="dot-grid absolute inset-0 text-sky-400 opacity-40" />
      <div aria-hidden="true" className="absolute top-1/2 left-0 h-3 w-full -translate-y-1/2 -rotate-6 bg-white" />
      <div aria-hidden="true" className="absolute top-0 left-1/3 h-full w-3 rotate-12 bg-white" />
      <span className="relative flex size-16 items-center justify-center">
        <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-gold-400 opacity-40" />
        <span className="relative flex size-14 items-center justify-center rounded-full bg-navy-700 text-white shadow-float">
          <MapPin aria-hidden="true" className="size-7" strokeWidth={1.75} />
        </span>
      </span>
      <button type="button" onClick={() => setLoaded(true)} className={buttonClass('primary', 'relative')}>
        <Map aria-hidden="true" className="size-5" strokeWidth={1.75} />
        {loadLabel}
      </button>
      <p className="relative max-w-xs rounded-full bg-white px-4 py-1.5 text-sm leading-5 text-muted">{note}</p>
    </div>
  );
}
