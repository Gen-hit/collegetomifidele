import type { Role } from './session';

/** Les mots de l'administration, au même endroit. L'interface est en français seulement. */

export const roleLabel: Record<Role, string> = {
  super_admin: 'Administrateur du site',
  principal: 'Principal',
  secretariat: 'Secrétariat',
};

export const statusLabel = {
  draft: 'Brouillon',
  submitted: 'À valider',
  published: 'En ligne',
} as const;

export const actionLabel: Record<string, string> = {
  create: 'a créé',
  update: 'a modifié',
  publish: 'a validé et publié',
  propose: 'a proposé une modification de',
  resolve: 'a traité la proposition sur',
  archive: 'a archivé',
  restore: 'a restauré',
  delete: 'a supprimé définitivement',
};

export const entityLabel: Record<string, string> = {
  news: 'l’actualité',
  calendar_events: 'la date',
  gallery_photos: 'la photo',
  documents: 'le document',
  content_blocks: 'les réglages',
  preinscriptions: 'la préinscription de',
  contact_messages: 'le message de',
};

const blockLabel: Record<string, string> = {
  contact: 'Coordonnées',
  admissions: 'Admissions',
  fees: 'Frais de scolarité',
  payment: 'Paiement',
  results: 'Résultats',
  team: 'Équipe de direction',
  photos: 'Photos du site',
};

/** « l’actualité « Rentrée 2026 » », « les réglages « Frais de scolarité » ». */
export function describeTarget(entity: string, label: string): string {
  const name = entity === 'content_blocks' ? (blockLabel[label] ?? label) : label;
  return `${entityLabel[entity] ?? entity}${name ? ` «\u00a0${name}\u00a0»` : ''}`;
}

/** « il y a 5 minutes », « hier », « le 3 octobre ». */
export function relativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  return `le ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Africa/Douala' }).format(then)}`;
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
