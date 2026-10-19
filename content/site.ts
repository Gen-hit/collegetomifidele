import contactData from './data/contact.json';

/**
 * Identité et coordonnées du collège : la seule source de ces informations.
 * Une valeur à `null` s'affiche sur le site comme un emplacement « à fournir ».
 * Aucun composant ne doit contenir un nom, un numéro ou une adresse en dur.
 *
 * D'OÙ VIENNENT LES DONNÉES : coordonnées, horaires, réseaux sociaux et chiffres clés sont dans
 * content/data/contact.json, que l'administration (Réglages > Coordonnées) réécrit à chaque mise à jour du site.
 * Le nom, la devise, le logo et le point de la carte restent ici.
 */
type ContactData = {
  address: string | null;
  city: string | null;
  phones: string[];
  whatsapp: string | null;
  email: string | null;
  openingHours: OpeningHours[];
  social: { facebook: string | null; instagram: string | null; youtube: string | null; tiktok: string | null; whatsappChannel: string | null };
  stats: { founded: number | null; students: number | null; teachers: number | null; successRate: number | null };
};
const contact = contactData as ContactData;

export type OpeningHours = { days: 'weekdays' | 'saturday' | 'sunday'; open: string | null; close: string | null; closed: boolean };

export const site = {
  name: 'Collège Tomi Fidele',
  shortName: 'CTF',
  /** Devise officielle, telle qu'elle figure sur le logo. */
  motto: 'Discipline · Travail · Succès',
  logo: { src: '/brand/ctf-logo.png', width: 178, height: 202 },

  /** Adresse définitive du site. À changer le jour où le nom de domaine existe. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://college-tomi-fidele.netlify.app',
  /** Tant que le site est en test, il reste hors de Google. */
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true',

  location: {
    /** Point fourni par WINX le 7 octobre 2026. */
    lat: 4.023973,
    lng: 9.790607,
    mapsUrl: 'https://maps.app.goo.gl/SJMvix47ieoz1B7c7',
    /** Quartier, rue ou repère : à fournir. */
    address: contact.address,
    /** Ville : à confirmer par le collège. */
    city: contact.city,
  },

  contact: {
    /** Numéros au format international, sans espace : '+2376XXXXXXXX'. */
    phones: contact.phones,
    /** Numéro WhatsApp du secrétariat, au format international sans « + ». */
    whatsapp: contact.whatsapp,
    email: contact.email,
  },

  /**
   * Heures d'ouverture du secrétariat, au format 'HH:MM' (par exemple open: '07:30', close: '15:30').
   * `null` = horaire à fournir. `closed: true` = fermé ce jour-là.
   */
  openingHours: contact.openingHours,

  /** Liens des réseaux sociaux. `null` = icône affichée, lien à renseigner. */
  social: contact.social,

  /** Chiffres clés. `null` = emplacement à fournir ; jamais de chiffre inventé. */
  stats: { ...contact.stats, sections: 2 },

  /** Bandeau d'annonce en haut du site. Le texte est dans messages/*.json. */
  announcement: { enabled: true, path: '/admissions' },
} as const;

export type Site = typeof site;
