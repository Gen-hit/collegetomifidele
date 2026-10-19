import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill, formatPercent } from '@/lib/format';
import { statFor } from './stats';

/**
 * Les cartes d'aperçu des résultats (pages Programmes et sections) : pour chaque examen demandé,
 * son dernier taux connu, ou un emplacement tant qu'aucune session n'est saisie.
 */
export function resultItems(examIds: string[], locale: Locale, dict: Dictionary): { label: string; value: string }[] {
  const t = dict.pages.results;
  return examIds.flatMap((id) => {
    const stat = statFor(id);
    if (!stat) return [];
    const session = stat.latest ? fill(t.session, { year: stat.latest.year }) : t.sessionPlaceholder;
    return [{ label: `${stat.exam.label} · ${session}`, value: formatPercent(stat.latest?.rate, locale, t.ratePlaceholder) }];
  });
}
