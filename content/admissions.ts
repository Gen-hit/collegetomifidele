import admissionsData from './data/admissions.json';

/**
 * Les dates et repères des admissions.
 * `null` affiche un emplacement « à fournir ». Les dates s'écrivent 'AAAA-MM-JJ'.
 *
 * D'OÙ VIENNENT LES DONNÉES : l'année scolaire et les dates des concours sont dans content/data/admissions.json,
 * réécrit par l'administration (Réglages > Admissions). Les libellés des concours restent ici.
 */
const dates = admissionsData.entranceExams as Record<string, string | null>;
export const admissions = {
  /** Année scolaire concernée, par exemple '2026-2027'. Affichée dans les titres et le bandeau d'annonce. */
  schoolYear: admissionsData.schoolYear as string | null,

  /** Concours d'entrée, dans l'ordre d'affichage. Le libellé garde le nom de la classe dans sa langue. */
  entranceExams: [
    { id: 'sixieme', label: { fr: 'Entrée en 6e', en: 'Entry into 6e' }, date: dates['sixieme'] ?? null },
    { id: 'premiere-annee', label: { fr: 'Entrée en 1re année technique', en: 'Entry into 1re année (technical)' }, date: dates['premiere-annee'] ?? null },
    { id: 'form-1', label: { fr: 'Entrée en Form 1', en: 'Entry into Form 1' }, date: dates['form-1'] ?? null },
    { id: 'form-1-technical', label: { fr: 'Entrée en Form 1 technique', en: 'Entry into Form 1 (technical)' }, date: dates['form-1-technical'] ?? null },
  ],
};
