/**
 * Fichiers d'agenda (.ics) et liens Google Agenda, pour des événements sur des journées entières.
 * Aucune bibliothèque : le format iCalendar (RFC 5545) se compose de simples lignes de texte.
 */
export type AgendaEvent = {
  /** Identifiant stable : l'agenda du visiteur s'en sert pour ne pas créer de doublon. */
  id: string;
  title: string;
  /** Premier jour, 'AAAA-MM-JJ'. */
  start: string;
  /** Dernier jour inclus. Absent : l'événement dure une journée. */
  end?: string;
  description?: string;
  url?: string;
  location?: string;
};

/** '2026-12-31' + 1 → '2027-01-01'. */
export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates : daysBetween('2026-09-07', '2026-09-10') → 3. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

const compact = (iso: string) => iso.replaceAll('-', '');

/** Dans un fichier d'agenda, la virgule, le point-virgule, la barre oblique inverse et le retour à la ligne s'échappent. */
function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Une ligne ne dépasse pas 75 octets : la suite passe à la ligne, précédée d'un espace. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const width = encoder.encode(char).length;
    // Les lignes de suite commencent par un espace, qui compte dans les 75 octets.
    const limit = parts.length === 0 ? 75 : 74;
    if (size + width > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += width;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

type IcsOptions = {
  /** Nom affiché par l'agenda pour l'ensemble des dates. */
  calendarName: string;
  /** Nom de domaine du site, pour former des identifiants uniques. */
  domain: string;
  /** Langue des textes : 'FR' ou 'EN'. */
  language: string;
  /** Date de création du fichier. Par défaut : maintenant. */
  stamp?: Date;
};

/** Compose le contenu d'un fichier .ics à partir d'une liste d'événements. */
export function buildIcs(events: AgendaEvent[], { calendarName, domain, language, stamp = new Date() }: IcsOptions): string {
  const dtstamp = `${stamp.toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${escapeText(calendarName)}//${language.toUpperCase()}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];
  for (const event of events) {
    const details = [event.description, event.url].filter(Boolean).join('\n\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@${domain}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${compact(event.start)}`,
      // La date de fin est exclue dans le format : on indique le lendemain du dernier jour.
      `DTEND;VALUE=DATE:${compact(addDays(event.end ?? event.start, 1))}`,
      `SUMMARY:${escapeText(event.title)}`,
    );
    if (details) lines.push(`DESCRIPTION:${escapeText(details)}`);
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    if (event.url) lines.push(`URL:${event.url}`);
    // Une date du calendrier scolaire n'occupe pas l'agenda : la personne reste « disponible ».
    lines.push('TRANSP:TRANSPARENT', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/** Lien qui ouvre Google Agenda avec l'événement pré-rempli. */
export function googleCalendarUrl(event: AgendaEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compact(event.start)}/${compact(addDays(event.end ?? event.start, 1))}`,
  });
  const details = [event.description, event.url].filter(Boolean).join('\n\n');
  if (details) params.set('details', details);
  if (event.location) params.set('location', event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Nom de fichier sans accent ni espace : « Rentrée scolaire » → « rentree-scolaire ». */
export function fileSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Dans le navigateur : propose le fichier .ics au téléchargement (le téléphone l'ouvre dans son agenda). */
export function downloadIcs(fileName: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileSlug(fileName)}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
