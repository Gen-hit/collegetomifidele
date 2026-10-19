import admissionsFr from '@messages/fr/admissions.json';
import { site } from '@content/site';
import { formatLocalPhone } from '@/lib/format';

/**
 * Les demandes des familles dans l'administration : préinscriptions et messages envoyés depuis le site.
 * Ce fichier ne contient que des données et des fonctions pures (testées dans lib.test.ts).
 */

export type Preinscription = {
  id: string;
  reference: string;
  student_name: string;
  target_class: string;
  section: string | null;
  stream: string | null;
  parent_name: string;
  parent_phone: string;
  message: string | null;
  locale: string;
  status: 'new' | 'contacted' | 'accepted' | 'rejected';
  internal_note: string;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  subject: string;
  message: string;
  locale: string;
  status: 'new' | 'handled';
  internal_note: string;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type RequestTable = 'preinscriptions' | 'contact_messages';

type Tone = 'neutral' | 'blue' | 'green' | 'gold' | 'red';

export const preinscriptionStatuses: { id: Preinscription['status']; label: string; tone: Tone }[] = [
  { id: 'new', label: 'Nouvelle', tone: 'gold' },
  { id: 'contacted', label: 'Famille contactée', tone: 'blue' },
  { id: 'accepted', label: 'Inscription confirmée', tone: 'green' },
  { id: 'rejected', label: 'Sans suite', tone: 'neutral' },
];

export const messageStatuses: { id: ContactMessage['status']; label: string; tone: Tone }[] = [
  { id: 'new', label: 'Nouveau', tone: 'gold' },
  { id: 'handled', label: 'Traité', tone: 'green' },
];

const sections = admissionsFr.form.sections as Record<string, string>;
const streams = admissionsFr.form.streams as Record<string, string>;

/** « 6e · Section francophone · Enseignement général » */
export function classLine(row: Pick<Preinscription, 'target_class' | 'section' | 'stream'>): string {
  return [row.target_class, row.section ? sections[row.section] : null, row.stream ? streams[row.stream] : null].filter(Boolean).join(' · ');
}

/** « +237 6 77 12 34 56 » */
export function displayPhone(phone: string): string {
  return phone ? `+237 ${formatLocalPhone(phone)}` : '';
}

/** Lien d'appel et lien WhatsApp vers la famille. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function whatsappToFamily(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

/** Premier message proposé au secrétariat pour répondre à une famille, dans sa langue. */
export function replyText(kind: RequestTable, row: Preinscription | ContactMessage): string {
  const en = row.locale === 'en';
  if (kind === 'preinscriptions') {
    const p = row as Preinscription;
    return en
      ? `Hello ${p.parent_name}, this is the school office of ${site.name}, about the pre-registration ${p.reference} for ${p.student_name} (${p.target_class}). `
      : `Bonjour ${p.parent_name}, ici le secrétariat du ${site.name}, au sujet de la préinscription ${p.reference} de ${p.student_name} (${p.target_class}). `;
  }
  const m = row as ContactMessage;
  return en
    ? `Hello ${m.name}, this is the school office of ${site.name}, replying to your message (${m.subject}). `
    : `Bonjour ${m.name}, ici le secrétariat du ${site.name}, en réponse à votre message (${m.subject}). `;
}

const plain = (text: unknown) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Recherche sans accents ni majuscules dans les champs utiles d'une demande. */
export function matchesQuery(row: Preinscription | ContactMessage, query: string): boolean {
  if (!query.trim()) return true;
  const digits = query.replace(/\D/g, '');
  const haystack = Object.entries(row)
    .filter(([key]) => !['id', 'handled_by', 'created_at', 'updated_at', 'deleted_at', 'locale', 'status'].includes(key))
    .map(([, value]) => value)
    .join(' ');
  if (digits.length >= 4 && haystack.replace(/\D/g, '').includes(digits)) return true;
  return plain(haystack).includes(plain(query.trim()));
}

/** « 19/10/2026 14:05 », à l'heure de Douala. */
export function dateTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Douala' }).format(new Date(iso));
}

/**
 * Tableau CSV lisible par Excel en français : séparateur « ; », marque UTF-8 en tête pour les accents,
 * valeurs entre guillemets dès qu'elles contiennent un séparateur, un guillemet ou un retour à la ligne.
 * Une valeur qui commence par = + - @ est préfixée d'une apostrophe, pour qu'Excel ne l'exécute pas comme formule.
 */
export function toCsv(header: string[], lines: (string | number | null | undefined)[][]): string {
  const cell = (value: string | number | null | undefined) => {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@]/.test(text) && !/^\+\d/.test(text)) text = `'${text}`;
    return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return '﻿' + [header, ...lines].map((line) => line.map(cell).join(';')).join('\r\n') + '\r\n';
}

export function preinscriptionsCsv(rows: Preinscription[], names: Record<string, string>): string {
  const label = Object.fromEntries(preinscriptionStatuses.map((s) => [s.id, s.label]));
  return toCsv(
    ['Numéro', 'Reçue le', 'Élève', 'Classe demandée', 'Section', 'Filière', 'Parent ou tuteur', 'Téléphone', 'Message', 'Suite donnée', 'Note interne', 'Traitée par'],
    rows.map((r) => [
      r.reference,
      dateTime(r.created_at),
      r.student_name,
      r.target_class,
      r.section ? sections[r.section] : '',
      r.stream ? streams[r.stream] : '',
      r.parent_name,
      displayPhone(r.parent_phone),
      r.message,
      label[r.status],
      r.internal_note,
      r.handled_by ? (names[r.handled_by] ?? '') : '',
    ]),
  );
}

export function messagesCsv(rows: ContactMessage[], names: Record<string, string>): string {
  const label = Object.fromEntries(messageStatuses.map((s) => [s.id, s.label]));
  return toCsv(
    ['Reçu le', 'Nom', 'Téléphone', 'Sujet', 'Message', 'Suite donnée', 'Note interne', 'Traité par'],
    rows.map((r) => [
      dateTime(r.created_at),
      r.name,
      displayPhone(r.phone),
      r.subject,
      r.message,
      label[r.status],
      r.internal_note,
      r.handled_by ? (names[r.handled_by] ?? '') : '',
    ]),
  );
}
