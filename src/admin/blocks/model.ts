import { normalizePhone } from '@/lib/phone';

/**
 * Les réglages du collège dans l'administration : un « bloc » par sujet, enregistré dans la table content_blocks,
 * recopié dans content/data/<bloc>.json à chaque mise à jour du site (scripts/pull-content.mjs).
 * Les formes ci-dessous sont celles de ces fichiers JSON : les deux doivent rester identiques.
 * Ce fichier ne contient que des types et des fonctions pures (testées dans lib.test.ts).
 */

export type BlockKey = 'contact' | 'admissions' | 'fees' | 'payment' | 'results' | 'team' | 'photos';

export type OpeningHours = { days: 'weekdays' | 'saturday' | 'sunday'; open: string | null; close: string | null; closed: boolean };

export type ContactBlock = {
  address: string | null;
  city: string | null;
  phones: string[];
  whatsapp: string | null;
  email: string | null;
  openingHours: OpeningHours[];
  social: { facebook: string | null; instagram: string | null; youtube: string | null; tiktok: string | null; whatsappChannel: string | null };
  stats: { founded: number | null; students: number | null; teachers: number | null; successRate: number | null };
};

export type AdmissionsBlock = { schoolYear: string | null; entranceExams: Record<string, string | null> };

export type Amount = number | null;
export type FeesBlock = {
  deadlines: (string | null)[];
  registration: { amount: Amount; newStudentsOnly: boolean };
  tuition: Record<string, { instalments: Amount[]; byClass?: Record<string, Amount[]> }>;
  gridPdf: string | null;
};

export type PaymentBlock = { mobileMoney: { id: string; number: string | null; holder: string | null }[]; cashDesk: boolean };

export type ResultsBlock = {
  sessions: { year: number; results: Record<string, { registered: number; passed: number }> }[];
  source: { fr: string; en: string } | null;
};

export type TeamPerson = { name: string | null; role: { fr: string; en: string }; photo: string | null };
export type TeamBlock = { principal: { name: string | null; photo: string | null }; others: TeamPerson[] };

export type PhotosBlock = { slots: Record<string, string | null> };

export type BlockData = {
  contact: ContactBlock;
  admissions: AdmissionsBlock;
  fees: FeesBlock;
  payment: PaymentBlock;
  results: ResultsBlock;
  team: TeamBlock;
  photos: PhotosBlock;
};

/** Erreurs de saisie : { chemin du champ : message }. */
export type Errors = Record<string, string>;

/** Un texte vide devient `null` : le site affiche alors l'emplacement « à fournir ». */
export const clean = (value: string | null | undefined): string | null => {
  const text = (value ?? '').trim();
  return text ? text : null;
};

/** « 150 000 », « 150000 », « 150.000 F » → 150000 ; vide → null ; illisible → NaN. */
export function parseAmount(input: string): number | null {
  const text = input.replace(/[\s  .]/g, '').replace(/(fcfa|cfa|f|xaf)$/i, '');
  if (!text) return null;
  return /^\d{1,9}$/.test(text) ? Number(text) : Number.NaN;
}

/** 150000 → « 150 000 » (espaces fines insécables, comme sur le site). */
export function formatAmount(value: Amount): string {
  return value === null || value === undefined ? '' : new Intl.NumberFormat('fr-FR').format(value);
}

const isUrl = (value: string) => /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(value);
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const isTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Coordonnées : numéros camerounais, email, adresses https, heures, chiffres plausibles. */
export function checkContact(data: ContactBlock): Errors {
  const errors: Errors = {};
  data.phones.forEach((phone, index) => {
    if (phone.trim() && !normalizePhone(phone)) errors[`phones.${index}`] = 'Numéro camerounais à 9 chiffres, par exemple 6 77 12 34 56.';
  });
  if (data.whatsapp?.trim() && !normalizePhone(data.whatsapp)) errors.whatsapp = 'Numéro camerounais à 9 chiffres.';
  if (data.email?.trim() && !isEmail(data.email.trim())) errors.email = 'Adresse email incomplète.';
  for (const [key, value] of Object.entries(data.social)) {
    if (value?.trim() && !isUrl(value.trim())) errors[`social.${key}`] = 'Collez l’adresse complète, qui commence par https://';
  }
  data.openingHours.forEach((row, index) => {
    if (row.closed) return;
    if (row.open && !isTime(row.open)) errors[`openingHours.${index}.open`] = 'Heure au format 07:30.';
    if (row.close && !isTime(row.close)) errors[`openingHours.${index}.close`] = 'Heure au format 15:30.';
    if (row.open && row.close && isTime(row.open) && isTime(row.close) && row.close <= row.open) errors[`openingHours.${index}.close`] = 'La fermeture suit l’ouverture.';
  });
  const year = new Date().getFullYear();
  const { founded, students, teachers, successRate } = data.stats;
  if (founded !== null && (!Number.isInteger(founded) || founded < 1900 || founded > year)) errors['stats.founded'] = `Une année entre 1900 et ${year}.`;
  if (students !== null && (!Number.isInteger(students) || students < 0 || students > 20000)) errors['stats.students'] = 'Un nombre d’élèves entier.';
  if (teachers !== null && (!Number.isInteger(teachers) || teachers < 0 || teachers > 2000)) errors['stats.teachers'] = 'Un nombre d’enseignants entier.';
  if (successRate !== null && (Number.isNaN(successRate) || successRate < 0 || successRate > 100)) errors['stats.successRate'] = 'Un pourcentage entre 0 et 100.';
  return errors;
}

/** Ce qui part dans la base : numéros au format du site, textes vides remplacés par null. */
export function normalizeContact(data: ContactBlock): ContactBlock {
  const phones = data.phones.map((p) => normalizePhone(p)).filter((p): p is string => Boolean(p));
  const whatsapp = data.whatsapp ? normalizePhone(data.whatsapp) : null;
  return {
    address: clean(data.address),
    city: clean(data.city),
    phones: [...new Set(phones)],
    whatsapp: whatsapp ? whatsapp.replace('+', '') : null,
    email: clean(data.email)?.toLowerCase() ?? null,
    openingHours: data.openingHours.map((row) => (row.closed ? { ...row, open: null, close: null } : { ...row, open: clean(row.open), close: clean(row.close) })),
    social: Object.fromEntries(Object.entries(data.social).map(([k, v]) => [k, clean(v)])) as ContactBlock['social'],
    stats: data.stats,
  };
}

export function checkAdmissions(data: AdmissionsBlock): Errors {
  const errors: Errors = {};
  const year = data.schoolYear?.trim();
  if (year) {
    const match = year.match(/^(\d{4})\s*[-–/]\s*(\d{4})$/);
    if (!match || Number(match[2]) !== Number(match[1]) + 1) errors.schoolYear = 'Deux années qui se suivent, par exemple 2026-2027.';
  }
  for (const [id, date] of Object.entries(data.entranceExams)) if (date && !isDate(date)) errors[`entranceExams.${id}`] = 'Date incomplète.';
  return errors;
}

export function normalizeAdmissions(data: AdmissionsBlock): AdmissionsBlock {
  const year = data.schoolYear?.trim().match(/^(\d{4})\s*[-–/]\s*(\d{4})$/);
  return {
    schoolYear: year ? `${year[1]}-${year[2]}` : null,
    entranceExams: Object.fromEntries(Object.entries(data.entranceExams).map(([k, v]) => [k, clean(v)])),
  };
}

export function checkFees(data: FeesBlock): Errors {
  const errors: Errors = {};
  data.deadlines.forEach((date, index) => {
    if (date && !isDate(date)) errors[`deadlines.${index}`] = 'Date incomplète.';
    if (index > 0 && date && data.deadlines[index - 1] && date <= (data.deadlines[index - 1] as string)) errors[`deadlines.${index}`] = 'Cette échéance doit suivre la précédente.';
  });
  const amount = (value: Amount, key: string) => {
    if (value !== null && (Number.isNaN(value) || value < 0)) errors[key] = 'Un montant en chiffres, par exemple 75 000.';
  };
  amount(data.registration.amount, 'registration.amount');
  for (const [level, row] of Object.entries(data.tuition)) row.instalments.forEach((value, index) => amount(value, `tuition.${level}.${index}`));
  return errors;
}

/** Ajoute ou retire une tranche : les échéances et les montants de chaque niveau gardent la même longueur. */
export function resizeInstalments(data: FeesBlock, count: number): FeesBlock {
  const fit = <T>(list: T[], filler: T) => (list.length >= count ? list.slice(0, count) : [...list, ...Array(count - list.length).fill(filler)]);
  return {
    ...data,
    deadlines: fit(data.deadlines, null),
    tuition: Object.fromEntries(
      Object.entries(data.tuition).map(([level, row]) => [
        level,
        { ...row, instalments: fit(row.instalments, null), ...(row.byClass ? { byClass: Object.fromEntries(Object.entries(row.byClass).map(([c, list]) => [c, fit(list, null)])) } : {}) },
      ]),
    ),
  };
}

export function checkPayment(data: PaymentBlock): Errors {
  const errors: Errors = {};
  data.mobileMoney.forEach((row, index) => {
    if (row.number?.trim() && !normalizePhone(row.number)) errors[`mobileMoney.${index}.number`] = 'Numéro camerounais à 9 chiffres.';
    if (row.number?.trim() && !row.holder?.trim()) errors[`mobileMoney.${index}.holder`] = 'Indiquez le nom qui s’affiche lors du transfert : les parents le vérifient.';
  });
  return errors;
}

export function normalizePayment(data: PaymentBlock): PaymentBlock {
  return {
    cashDesk: data.cashDesk,
    mobileMoney: data.mobileMoney.map((row) => {
      const number = row.number ? normalizePhone(row.number) : null;
      return { id: row.id, number: number ? number.replace('+237', '') : null, holder: number ? clean(row.holder) : null };
    }),
  };
}

export function checkResults(data: ResultsBlock): Errors {
  const errors: Errors = {};
  const seen = new Set<number>();
  const year = new Date().getFullYear();
  data.sessions.forEach((session, index) => {
    if (!Number.isInteger(session.year) || session.year < 1990 || session.year > year + 1) errors[`sessions.${index}.year`] = 'Année de la session, par exemple 2026.';
    else if (seen.has(session.year)) errors[`sessions.${index}.year`] = 'Cette session existe déjà.';
    seen.add(session.year);
    for (const [exam, r] of Object.entries(session.results)) {
      const key = `sessions.${index}.${exam}`;
      if (!Number.isInteger(r.registered) || !Number.isInteger(r.passed) || r.registered < 0 || r.passed < 0) errors[key] = 'Des nombres entiers.';
      else if (r.passed > r.registered) errors[key] = 'Plus d’admis que d’inscrits.';
      else if (r.registered === 0) errors[key] = 'Au moins un inscrit, ou laissez la ligne vide.';
    }
  });
  if (data.source && !data.source.fr.trim() && data.source.en.trim()) errors['source.fr'] = 'La source en français est attendue.';
  return errors;
}

export function normalizeResults(data: ResultsBlock): ResultsBlock {
  const fr = data.source?.fr.trim() ?? '';
  const en = data.source?.en.trim() ?? '';
  return {
    sessions: [...data.sessions].sort((a, b) => a.year - b.year),
    source: fr ? { fr, en: en || fr } : null,
  };
}

export function checkTeam(data: TeamBlock): Errors {
  const errors: Errors = {};
  data.others.forEach((person, index) => {
    if (!person.role.fr.trim()) errors[`others.${index}.role`] = 'Indiquez la fonction.';
  });
  return errors;
}

export function normalizeTeam(data: TeamBlock): TeamBlock {
  return {
    principal: { name: clean(data.principal.name), photo: data.principal.photo },
    others: data.others.map((p) => ({ name: clean(p.name), role: { fr: p.role.fr.trim(), en: p.role.en.trim() || p.role.fr.trim() }, photo: p.photo })),
  };
}

/** Les vérifications et la mise au propre de chaque bloc, au même endroit. */
export const blockRules: { [K in BlockKey]: { check: (data: BlockData[K]) => Errors; normalize: (data: BlockData[K]) => BlockData[K] } } = {
  contact: { check: checkContact, normalize: normalizeContact },
  admissions: { check: checkAdmissions, normalize: normalizeAdmissions },
  fees: { check: checkFees, normalize: (d) => d },
  payment: { check: checkPayment, normalize: normalizePayment },
  results: { check: checkResults, normalize: normalizeResults },
  team: { check: checkTeam, normalize: normalizeTeam },
  photos: { check: () => ({}), normalize: (d) => d },
};
