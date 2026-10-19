'use client';

import { Check, CircleCheck, Copy, Mail, Pencil } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { buttonClass } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';

type MessageReadyProps = {
  /** Le message composé à partir du formulaire. */
  message: string;
  /** Numéro WhatsApp du secrétariat (content/site.ts). `null` : le message est proposé à la copie. */
  whatsapp: string | null;
  labels: { title: string; sent: string; open: string; noNumber: string; copy: string; copied: string; edit: string };
  /** Revenir au formulaire pour corriger. */
  onEdit: () => void;
  /** Envoi par email, en complément : adresse, objet et libellé du bouton. */
  email?: { address: string; subject: string; label: string };
  /** Bouton de secours quand le numéro WhatsApp manque (lien vers la page Contact, par exemple). */
  fallback?: ReactNode;
  /** Mention affichée sous les boutons. */
  footnote?: string;
};

/**
 * Écran de confirmation d'un formulaire « vers WhatsApp » : le message prêt à partir,
 * le bouton pour l'ouvrir dans WhatsApp, la copie et le retour au formulaire.
 * Utilisé par la préinscription et par le formulaire de contact.
 */
export function MessageReady({ message, whatsapp, labels, onEdit, email, fallback, footnote }: MessageReadyProps) {
  const [copied, setCopied] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const waUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : null;

  // Le lecteur d'écran et le clavier sont amenés sur la confirmation dès qu'elle apparaît.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Presse-papiers indisponible : le message reste affiché, il peut être sélectionné à la main.
    }
  };

  return (
    <div className="flex animate-pop flex-col gap-5 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <h3 ref={titleRef} tabIndex={-1} className="flex scroll-mt-28 items-center gap-3 font-display text-2xl leading-8 font-bold text-navy-700 outline-none">
        <CircleCheck aria-hidden="true" className="size-8 shrink-0 text-green-700" strokeWidth={1.75} />
        {labels.title}
      </h3>
      {waUrl ? <p>{labels.sent}</p> : <Notice tone="warning">{labels.noNumber}</Notice>}
      <p className="rounded-2xl border border-line bg-surface-alt p-4 text-[15px] leading-6 wrap-break-word whitespace-pre-wrap">{message}</p>
      <div className="flex flex-wrap gap-3">
        {waUrl ? (
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('whatsapp')}>
            <FaWhatsapp aria-hidden="true" className="size-5" />
            {labels.open}
          </a>
        ) : (
          fallback
        )}
        {email ? (
          <a
            href={`mailto:${email.address}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(message)}`}
            className={buttonClass(waUrl ? 'secondary' : 'primary')}
          >
            <Mail aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {email.label}
          </a>
        ) : null}
        <button type="button" onClick={copy} className={buttonClass('secondary')}>
          {copied ? <Check aria-hidden="true" className="size-5" strokeWidth={2} /> : <Copy aria-hidden="true" className="size-5" strokeWidth={1.75} />}
          <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
        </button>
        <button type="button" onClick={onEdit} className="inline-flex min-h-12 items-center gap-2 px-2 font-semibold text-blue-600 underline underline-offset-4">
          <Pencil aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
          {labels.edit}
        </button>
      </div>
      {footnote ? <p className="text-sm leading-5 text-muted">{footnote}</p> : null}
    </div>
  );
}
