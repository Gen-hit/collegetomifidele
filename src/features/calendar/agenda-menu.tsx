'use client';

import { CalendarPlus, Download } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { FaGoogle } from 'react-icons/fa6';
import { actionButtonClass, menuContentClass, menuItemClass, menuLabelClass } from '@/components/ui/menu';
import { useOrigin } from '@/lib/hooks';
import { buildIcs, downloadIcs, googleCalendarUrl, type AgendaEvent } from '@/lib/ics';
import { cn } from '@/lib/utils';

export type AgendaLabels = { agenda: string; addTitle: string; google: string; ics: string; icsHint: string };

type AgendaMenuProps = {
  event: Omit<AgendaEvent, 'url'>;
  /** Chemin de la page de l'événement, ancre comprise : il est joint à la description. */
  path: string;
  labels: AgendaLabels;
  /** Nom accessible du bouton : « Ajouter à mon agenda : Rentrée scolaire ». */
  ariaLabel: string;
  /** Nom de l'agenda dans le fichier .ics, et langue des textes. */
  calendarName: string;
  language: string;
  /** Masque le texte du bouton sur téléphone : il ne reste que le pictogramme. */
  compact?: boolean;
};

/**
 * Bouton « Agenda » d'un événement : ouvre Google Agenda avec l'événement pré-rempli,
 * ou télécharge un fichier .ics que l'agenda du téléphone sait lire.
 */
export function AgendaMenu({ event, path, labels, ariaLabel, calendarName, language, compact = false }: AgendaMenuProps) {
  const origin = useOrigin();
  const full: AgendaEvent = { ...event, url: `${origin}${path}` };

  const download = () => {
    downloadIcs(event.title, buildIcs([full], { calendarName, domain: new URL(origin).hostname, language }));
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger aria-label={ariaLabel} className={actionButtonClass}>
        <CalendarPlus aria-hidden="true" className="size-4.5 shrink-0" strokeWidth={1.75} />
        <span className={cn(compact && 'sr-only sm:not-sr-only')}>{labels.agenda}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} collisionPadding={12} className={menuContentClass}>
          <DropdownMenu.Label className={menuLabelClass}>{labels.addTitle}</DropdownMenu.Label>
          <DropdownMenu.Item asChild className={menuItemClass}>
            <a href={googleCalendarUrl(full)} target="_blank" rel="noopener noreferrer">
              <FaGoogle aria-hidden="true" className="size-4.5 shrink-0 text-blue-500" />
              {labels.google}
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={download} className={menuItemClass}>
            <Download aria-hidden="true" className="size-5 shrink-0 text-blue-500" strokeWidth={1.75} />
            <span className="flex flex-col">
              {labels.ics}
              <span className="text-[13px] leading-4 font-normal text-muted">{labels.icsHint}</span>
            </span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
