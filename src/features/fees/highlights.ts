import { admissions } from '@content/admissions';
import { fees } from '@content/fees';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatDate, formatMoney } from '@/lib/format';
import { lowestTuition } from './simulate';

export type Highlight = { label: string; value: string; note: string };

/** Le prochain concours : la première date à venir au moment où le site est construit, sinon la dernière connue. */
export function nextEntranceExam(today = new Date()) {
  const dated = admissions.entranceExams
    .filter((exam): exam is typeof exam & { date: string } => exam.date !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
  const iso = today.toISOString().slice(0, 10);
  return dated.find((exam) => exam.date >= iso) ?? dated.at(-1) ?? null;
}

/**
 * Les trois repères des admissions : frais d'inscription, scolarité « à partir de », prochain concours.
 * Affichés sur l'accueil et sur la page Admissions. Tant qu'une donnée manque dans content/,
 * la carte garde son emplacement entre crochets.
 */
export function admissionHighlights(locale: Locale, dict: Dictionary): Highlight[] {
  const t = dict.pages.admissions.fees;
  const [registration, tuition, exam] = dict.home.admissions.cards;
  const lowest = lowestTuition(fees);
  const next = nextEntranceExam();

  return [
    {
      label: t.registration,
      value: formatMoney(fees.registration.amount, locale, registration.value),
      note: fees.registration.amount === null ? registration.note : fees.registration.newStudentsOnly ? t.registrationNew : t.registrationYearly,
    },
    {
      label: t.tuition,
      value: lowest === null ? tuition.value : fill(t.tuitionFrom, { amount: formatMoney(lowest, locale, '') }),
      note: lowest === null ? tuition.note : fill(t.tuitionNote, { count: fees.deadlines.length }),
    },
    {
      label: t.exam,
      value: formatDate(next?.date, locale, exam.value),
      note: next ? next.label[locale] : exam.note,
    },
  ];
}

/** L'année scolaire des admissions, ou son emplacement. */
export function schoolYear(dict: Dictionary): string {
  return admissions.schoolYear ?? dict.common.yearPlaceholder;
}
