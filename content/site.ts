import contactData from './data/contact.json';
import schoolData from './data/school.json';

/**
 * Identité et coordonnées du collège : la seule source de ces informations.
 * Une valeur à `null` s'affiche sur le site comme un emplacement « à fournir ».
 * Aucun composant ne doit contenir un nom, un numéro ou une adresse en dur.
 *
 * D'OÙ VIENNENT LES DONNÉES : coordonnées, horaires, réseaux sociaux et chiffres clés sont dans
 * content/data/contact.json, que l'administration (Réglages > Coordonnées) réécrit à chaque mise à jour du site.
 * Le nom, la devise, le logo et le point de la carte sont dans content/data/school.json.
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

/**
 * Identité de l'établissement : content/data/school.json. C'est le SEUL fichier à changer
 * pour ouvrir le site d'une autre école (voir docs/nouveau-site-ecole.md).
 */
type SchoolData = {
  name: string;
  shortName: string;
  slug: string;
  motto: string;
  logo: { src: string; width: number; height: number };
  ogImagePrefix: string;
  url: string;
  location: { lat: number; lng: number; mapsUrl: string };
};
const school = schoolData as SchoolData;

export const site = {
  name: school.name,
  shortName: school.shortName,
  /** Identifiant de l'école dans la base du back-office. */
  slug: process.env.NEXT_PUBLIC_SCHOOL_SLUG || school.slug,
  /** Devise officielle, telle qu'elle figure sur le logo. */
  motto: school.motto,
  logo: school.logo,
  /** Préfixe des images de partage (public/og/<préfixe>-fr.jpg). */
  ogImagePrefix: school.ogImagePrefix,

  /** Adresse définitive du site. À changer le jour où le nom de domaine existe. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? school.url,
  /** Tant que le site est en test, il reste hors de Google. */
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true',

  location: {
    lat: school.location.lat,
    lng: school.location.lng,
    mapsUrl: school.location.mapsUrl,
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
