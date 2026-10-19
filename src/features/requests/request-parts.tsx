'use client';

import { CircleCheck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { buttonClass } from '@/components/ui/button';

/**
 * Pièces communes aux deux formulaires des familles (préinscription, contact) quand ils enregistrent la demande :
 * la case piège pour les robots, la case de consentement et l'écran « demande enregistrée ».
 */

/** Case invisible pour les personnes : seuls les robots la remplissent. */
export function TrapField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Site web
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    </div>
  );
}

type ConsentProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  labels: { label: string; link: string; error: string };
  privacyHref: string;
  invalid: boolean;
};

export function ConsentField({ id, checked, onChange, labels, privacyHref, invalid }: ConsentProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[15px] leading-6">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-navy-700"
        />
        <span>
          {labels.label}{' '}
          <Link href={privacyHref} className="font-semibold text-blue-600 underline underline-offset-4">
            {labels.link}
          </Link>
        </span>
      </label>
      {invalid ? (
        <p id={`${id}-error`} className="pl-8 text-sm leading-5 font-semibold text-red-700">
          {labels.error}
        </p>
      ) : null}
    </div>
  );
}

type SavedProps = {
  title: string;
  /** Numéro de suivi (préinscription), absent pour un simple message. */
  reference?: { label: string; value: string; keep: string } | null;
  callback: string;
  /** Lien WhatsApp vers le secrétariat avec le message déjà rédigé, s'il y a un numéro. */
  whatsappUrl: string | null;
  whatsappLabel: string;
  againLabel: string;
  onAgain: () => void;
  footnote?: string;
};

export function RequestSaved({ title, reference, callback, whatsappUrl, whatsappLabel, againLabel, onAgain, footnote }: SavedProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Le formulaire, plus long, laisse place à la confirmation : on la ramène sous les yeux et on y place le focus.
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    title.focus({ preventScroll: true });
    title.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  return (
    <div role="status" className="flex animate-pop flex-col gap-5 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <h3 ref={titleRef} tabIndex={-1} className="flex scroll-mt-28 items-center gap-3 font-display text-2xl leading-8 font-bold text-navy-700 outline-none">
        <CircleCheck aria-hidden="true" className="size-8 shrink-0 text-green-700" strokeWidth={1.75} />
        {title}
      </h3>
      {reference ? (
        <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-alt p-4">
          <span className="text-sm font-semibold text-muted">{reference.label}</span>
          <span className="font-display text-3xl leading-9 font-bold tracking-wide text-navy-700">{reference.value}</span>
          <span className="text-[15px] leading-6">{reference.keep}</span>
        </div>
      ) : null}
      <p>{callback}</p>
      <div className="flex flex-wrap gap-3">
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>
            <FaWhatsapp aria-hidden="true" className="size-5" />
            {whatsappLabel}
          </a>
        ) : null}
        <button type="button" onClick={onAgain} className="inline-flex min-h-12 items-center gap-2 px-2 font-semibold text-blue-600 underline underline-offset-4">
          <RotateCcw aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
          {againLabel}
        </button>
      </div>
      {footnote ? <p className="text-sm leading-5 text-muted">{footnote}</p> : null}
    </div>
  );
}

/** Heure d'affichage du formulaire, notée une fois le composant monté. */
export function useFormClock() {
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  return startedAt;
}
