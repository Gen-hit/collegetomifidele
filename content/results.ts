import resultsData from './data/results.json';

/**
 * Les résultats aux examens officiels.
 * La page « Résultats », et les aperçus des pages Programmes, lisent ce fichier.
 *
 * RÈGLE : uniquement les chiffres officiels du collège. Sans session saisie, le site affiche des emplacements.
 *
 * Pour ajouter une session : copier le bloc d'exemple ci-dessous dans `sessions`, puis saisir pour chaque
 * examen le nombre d'inscrits et le nombre d'admis. Le site calcule les taux et les évolutions.
 * Un examen non présenté cette année-là : ne pas écrire sa ligne.
 *
 * D'OÙ VIENNENT LES DONNÉES : les sessions et la source sont dans content/data/results.json,
 * que l'administration (Réglages > Résultats aux examens) réécrit. La liste des examens suivis reste ici.
 */
export type Exam = {
  id: string;
  /** Nom officiel de l'examen, identique dans les deux langues. */
  label: string;
  section: 'francophone' | 'anglophone';
};

/** Les examens suivis, dans l'ordre d'affichage. Ajouter une ligne pour suivre un autre examen. */
export const exams: Exam[] = [
  { id: 'bepc', label: 'BEPC', section: 'francophone' },
  { id: 'cap', label: 'CAP', section: 'francophone' },
  { id: 'probatoire', label: 'Probatoire', section: 'francophone' },
  { id: 'baccalaureat', label: 'Baccalauréat', section: 'francophone' },
  { id: 'gce-ol', label: 'GCE O Level', section: 'anglophone' },
  { id: 'gce-al', label: 'GCE A Level', section: 'anglophone' },
  { id: 'gce-tech', label: 'GCE Technical', section: 'anglophone' },
];

export type ExamResult = { registered: number; passed: number };
export type Session = { year: number; results: Record<string, ExamResult> };

/**
 * Les sessions, de la plus ancienne à la plus récente.
 *
 * Exemple de bloc à copier (les nombres sont à remplacer par ceux du collège) :
 *
 *   {
 *     year: 2026,
 *     results: {
 *       bepc: { registered: 0, passed: 0 },
 *       baccalaureat: { registered: 0, passed: 0 },
 *       'gce-ol': { registered: 0, passed: 0 },
 *     },
 *   },
 */
export const sessions: Session[] = [...(resultsData.sessions as Session[])].sort((a, b) => a.year - b.year);

/** D'où viennent les chiffres : affiché sous les résultats. `null` = emplacement « à préciser ». */
export const resultsSource: { fr: string; en: string } | null = (resultsData.source as { fr: string; en: string } | null) ?? null;
