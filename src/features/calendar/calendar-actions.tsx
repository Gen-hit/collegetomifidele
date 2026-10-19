'use client';

import { CalendarPlus } from 'lucide-react';
import { buttonClass } from '@/components/ui/button';
import { ShareMenu, type ShareLabels } from '@/components/ui/share-buttons';
import { fill } from '@/lib/format';
import { useOrigin } from '@/lib/hooks';
import { buildIcs, downloadIcs } from '@/lib/ics';
import type { CalendarItem } from './dates';

type CalendarActionsProps = {
  items: CalendarItem[];
  labels: { downloadAll: string; shareCalendar: string; fileName: string };
  shareLabels: ShareLabels;
  /** Texte du partage : « Calendrier scolaire 2026-2027 du Collège Tomi Fidele ». */
  shareText: string;
  /** Chemin de la page du calendrier : '/fr/calendar/'. */
  path: string;
  school: string;
  calendarName: string;
  language: string;
  year: string;
};

/** Les deux actions du bandeau : ajouter toutes les dates à son agenda, partager le calendrier. */
export function CalendarActions({ items, labels, shareLabels, shareText, path, school, calendarName, language, year }: CalendarActionsProps) {
  const origin = useOrigin();

  const downloadAll = () => {
    const events = items.map((item) => ({
      id: item.id,
      title: item.title,
      start: item.start,
      end: item.end,
      description: item.note,
      location: school,
      url: `${origin}${path}#evt-${item.id}`,
    }));
    downloadIcs(fill(labels.fileName, { year }), buildIcs(events, { calendarName, domain: new URL(origin).hostname, language }));
  };

  return (
    <div className="mt-3 flex animate-rise flex-wrap gap-3 [animation-delay:220ms]">
      <button type="button" onClick={downloadAll} className={buttonClass('gold')}>
        <CalendarPlus aria-hidden="true" className="size-5" strokeWidth={1.75} />
        {labels.downloadAll}
      </button>
      <ShareMenu path={path} title={shareText} text={shareText} labels={shareLabels} buttonLabel={labels.shareCalendar} triggerClassName={buttonClass('ghost')} />
    </div>
  );
}
