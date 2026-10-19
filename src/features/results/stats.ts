import { exams, sessions, type Exam, type Session } from '@content/results';

export type ExamStat = {
  exam: Exam;
  /** Résultat de la dernière session où l'examen a été présenté. */
  latest: { year: number; registered: number; passed: number; rate: number } | null;
  /** Écart de taux avec la session précédente, en points de pourcentage. */
  delta: number | null;
  /** Taux de chaque session connue, de la plus ancienne à la plus récente. */
  history: { year: number; rate: number }[];
};

function rate(passed: number, registered: number): number | null {
  if (registered <= 0 || passed < 0 || passed > registered) return null;
  return passed / registered;
}

/**
 * Les sessions triées par année, quel que soit l'ordre de saisie dans `content/results.ts`.
 * Une saisie impossible (plus d'admis que d'inscrits, nombre négatif, année en double) arrête la
 * construction du site avec un message clair : mieux vaut une erreur visible qu'un faux taux publié.
 */
export function sortedSessions(all: Session[] = sessions): Session[] {
  const years = new Set<number>();
  for (const session of all) {
    if (years.has(session.year)) throw new Error(`content/results.ts : la session ${session.year} est saisie deux fois.`);
    years.add(session.year);
    for (const [examId, result] of Object.entries(session.results)) {
      const known = exams.some((exam) => exam.id === examId);
      if (!known) throw new Error(`content/results.ts : session ${session.year}, examen inconnu « ${examId} ». Ajoutez-le à la liste \`exams\`.`);
      if (rate(result.passed, result.registered) === null) {
        throw new Error(
          `content/results.ts : session ${session.year}, ${examId} : ${result.passed} admis pour ${result.registered} inscrits est impossible.`,
        );
      }
    }
  }
  return [...all].sort((a, b) => a.year - b.year);
}

/** Taux, évolution et historique d'un examen. */
export function examStat(exam: Exam, all: Session[] = sessions): ExamStat {
  const history: (ExamStat['history'][number] & { registered: number; passed: number })[] = [];
  for (const session of sortedSessions(all)) {
    const result = session.results[exam.id];
    if (!result) continue;
    const value = rate(result.passed, result.registered);
    if (value === null) continue;
    history.push({ year: session.year, rate: value, registered: result.registered, passed: result.passed });
  }
  const last = history.at(-1) ?? null;
  const previous = history.at(-2) ?? null;
  return {
    exam,
    latest: last,
    delta: last && previous ? (last.rate - previous.rate) * 100 : null,
    history: history.map(({ year, rate: value }) => ({ year, rate: value })),
  };
}

export function allExamStats(all: Session[] = sessions): ExamStat[] {
  return exams.map((exam) => examStat(exam, all));
}

export function statFor(examId: string): ExamStat | null {
  const exam = exams.find((item) => item.id === examId);
  return exam ? examStat(exam) : null;
}

/** L'année de la session la plus récente, ou `null` si aucune session n'est saisie. */
export function latestYear(all: Session[] = sessions): number | null {
  return sortedSessions(all).at(-1)?.year ?? null;
}

/** Bilan global d'une session : tous les admis sur tous les inscrits. */
export function overall(session: Session): { rate: number; passed: number; registered: number } | null {
  let registered = 0;
  let passed = 0;
  for (const result of Object.values(session.results)) {
    if (rate(result.passed, result.registered) === null) continue;
    registered += result.registered;
    passed += result.passed;
  }
  const value = rate(passed, registered);
  return value === null ? null : { rate: value, passed, registered };
}
