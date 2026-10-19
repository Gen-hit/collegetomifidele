'use client';

import { Bot, LifeBuoy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { AssistantPanel, type AssistantTopic } from '@/features/assistant/assistant-panel';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/utils';

type HelpLauncherProps = {
  locale: Locale;
  labels: Dictionary['help'];
  assistantLabels: Omit<Dictionary['assistant'], 'topics'>;
  topics: AssistantTopic[];
  whatsappHref: string;
};

/**
 * Bouton d'aide flottant, unique : il ouvre deux choix, l'assistant du collège et WhatsApp.
 * Une seule bulle à l'écran plutôt que deux.
 */
export function HelpLauncher({ locale, labels, assistantLabels, topics, whatsappHref }: HelpLauncherProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen]);

  const actionClass =
    'flex min-h-14 w-full items-center gap-3 rounded-2xl border border-line bg-white py-2 pr-5 pl-2 text-left shadow-float ' +
    'transition duration-200 hover:-translate-y-0.5 hover:border-navy-700';

  return (
    <>
      <div ref={rootRef} className="fixed right-3 bottom-3 z-40 flex flex-col items-end gap-3 sm:right-4 sm:bottom-4 print:hidden">
        {menuOpen ? (
          <div id="help-menu" className="flex w-64 animate-pop flex-col gap-2">
            <button
              type="button"
              className={actionClass}
              onClick={() => {
                setMenuOpen(false);
                setAssistantOpen(true);
              }}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink">
                <Bot aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-ink">{labels.assistant}</span>
                <span className="text-sm leading-5 text-muted">{labels.assistantDesc}</span>
              </span>
            </button>
            <a href={whatsappHref} className={actionClass} onClick={() => setMenuOpen(false)}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                <FaWhatsapp aria-hidden="true" className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-ink">{labels.whatsapp}</span>
                <span className="text-sm leading-5 text-muted">{labels.whatsappDesc}</span>
              </span>
            </a>
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="help-menu"
          aria-label={menuOpen ? labels.close : labels.open}
          title={menuOpen ? labels.close : labels.open}
          onClick={() => setMenuOpen((value) => !value)}
          className={cn(
            // Une pastille ronde, sans texte, tant que la page occupe toute la largeur : elle couvre le moins de contenu possible.
            // Le libellé n'apparaît que sur les grands écrans (1 536 px et plus), où le bouton tient dans la marge.
            'flex size-13 items-center justify-center gap-2 rounded-full border-2 border-white font-semibold text-white shadow-float sm:size-14 2xl:w-auto 2xl:px-5',
            'transition duration-200 hover:-translate-y-0.5',
            menuOpen ? 'bg-indigo-900' : 'bg-navy-700 hover:bg-indigo-900',
          )}
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-6" strokeWidth={2} />
          ) : (
            <LifeBuoy aria-hidden="true" className="size-6" strokeWidth={1.75} />
          )}
          <span className="sr-only 2xl:not-sr-only">{labels.label}</span>
        </button>
      </div>

      <AssistantPanel
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        locale={locale}
        labels={assistantLabels}
        topics={topics}
        whatsappHref={whatsappHref}
      />
    </>
  );
}
