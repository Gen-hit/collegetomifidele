/**
 * Les niveaux du collège : deux sections, deux filières, deux cycles chacune.
 * Cette liste sert à la grille des frais, au simulateur et au formulaire de préinscription.
 * Les noms de classes restent dans la langue de leur section.
 *
 * Pour retirer un niveau que le collège ne propose pas : supprimer sa ligne ici
 * et sa ligne dans `content/fees.ts`.
 */
export type SectionId = 'francophone' | 'anglophone';
export type StreamId = 'general' | 'technical';

export type Level = {
  /** Identifiant stable, utilisé dans `content/fees.ts`. */
  id: string;
  section: SectionId;
  stream: StreamId;
  cycle: 1 | 2;
  classes: string[];
};

export const levels: Level[] = [
  { id: 'fr-general-1', section: 'francophone', stream: 'general', cycle: 1, classes: ['6e', '5e', '4e', '3e'] },
  { id: 'fr-general-2', section: 'francophone', stream: 'general', cycle: 2, classes: ['2nde', '1re', 'Terminale'] },
  { id: 'fr-technical-1', section: 'francophone', stream: 'technical', cycle: 1, classes: ['1re année', '2e année', '3e année', '4e année'] },
  { id: 'fr-technical-2', section: 'francophone', stream: 'technical', cycle: 2, classes: ['2nde', '1re', 'Terminale'] },
  { id: 'en-general-1', section: 'anglophone', stream: 'general', cycle: 1, classes: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'] },
  { id: 'en-general-2', section: 'anglophone', stream: 'general', cycle: 2, classes: ['Lower Sixth', 'Upper Sixth'] },
  { id: 'en-technical-1', section: 'anglophone', stream: 'technical', cycle: 1, classes: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'] },
  { id: 'en-technical-2', section: 'anglophone', stream: 'technical', cycle: 2, classes: ['Lower Sixth', 'Upper Sixth'] },
];

/** Langue des noms de classes de chaque section. */
export const sectionLang: Record<SectionId, 'fr' | 'en'> = { francophone: 'fr', anglophone: 'en' };
