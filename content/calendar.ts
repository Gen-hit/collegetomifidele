import calendarData from './data/calendar.json';

/**
 * Le calendrier de l'année scolaire : la seule source des dates affichées sur la page « Calendrier scolaire »
 * et dans le bloc « Les dates de l'année » de la page « Vie scolaire ».
 *
 * AJOUTER UNE DATE (sans back-office) : copier une entrée de content/data/calendar.json, changer `id` (unique, sans espace ni accent),
 * le titre dans les deux langues, la catégorie et la date au format 'AAAA-MM-JJ'.
 *   - Un événement sur plusieurs jours a aussi `end` : le dernier jour, inclus.
 *   - `start: null` range l'événement dans « Dates à confirmer » : remplacer `null` dès que la date est connue.
 *   - `confirm: true` affiche la mention « À confirmer » à côté de la date.
 *   - Supprimer la ligne d'un événement qui n'existe pas au collège.
 *
 * D'OÙ VIENNENT LES DATES
 *   - Rentrée, congés de Noël et de Pâques, fin d'année, période des examens : arrêté conjoint MINEDUB-MINESEC
 *     du 14 août 2026, tel que la presse l'a publié. À vérifier sur le document officiel avant la mise en ligne.
 *   - Trimestres : le collège suit l'usage des établissements. Le premier trimestre s'achève au départ en congés
 *     de Noël, le deuxième au départ en congés de Pâques. (La presse rapporte un autre découpage administratif,
 *     avec un premier trimestre clos le 27 novembre : à trancher par la direction.)
 *   - Jours fériés à date fixe, Vendredi saint et Ascension (calculés à partir de Pâques, le 28 mars 2027),
 *     journées internationales : dates certaines.
 *   - Calendrier interne du collège (séquences, examens blancs, conseils de classe, bulletins, réunions,
 *     portes ouvertes, semaine culturelle) : PROPOSITIONS réalistes, toutes marquées `confirm: true`.
 *     La direction les valide ou les corrige, puis retire `confirm: true`.
 *   - Dates de chaque examen officiel : non publiées à ce jour, laissées à `null`.
 *
 * D'OÙ VIENNENT LES DONNÉES
 *   Elles sont dans content/data/calendar.json. Quand le back-office est relié (réglages NEXT_PUBLIC_SUPABASE_URL et
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY), ce fichier est réécrit à chaque construction du site avec le contenu publié dans
 *   l'administration (/admin) : on les modifie alors là-bas, pas ici. Sans back-office, on modifie
 *   directement content/data/calendar.json, en gardant la forme décrite ci-dessous.
 */
export type CalendarCategory = 'term' | 'evaluation' | 'exam' | 'holiday' | 'international' | 'openDay' | 'culture' | 'meeting';

export type CalendarEvent = {
  /** Identifiant unique : il sert de lien de partage (…/calendar/#evt-<id>). Ne pas le changer après publication. */
  id: string;
  title: { fr: string; en: string };
  category: CalendarCategory;
  /** Premier jour, 'AAAA-MM-JJ'. `null` : date à confirmer. */
  start: string | null;
  /** Dernier jour inclus, pour un événement de plusieurs jours. */
  end?: string;
  /** Précision facultative : horaire, lieu, classes concernées. */
  note?: { fr: string; en: string };
  /** Date reprise d'une seule source, ou encore provisoire. */
  confirm?: boolean;
};

/** L'ordre d'affichage des catégories dans les filtres. Les libellés sont dans messages/<langue>/calendar.json. */
export const calendarCategories: CalendarCategory[] = ['term', 'evaluation', 'exam', 'holiday', 'international', 'openDay', 'culture', 'meeting'];

export const calendar = {
  /** L'année scolaire présentée. */
  schoolYear: '2026-2027',

  /** D'où viennent les dates nationales. Affiché sous le calendrier. */
  source: {
    fr: "Dates nationales : arrêté conjoint MINEDUB-MINESEC du 14 août 2026 fixant le calendrier de l'année scolaire 2026-2027.",
    en: 'National dates: joint MINEDUB-MINESEC order of 14 August 2026 setting the 2026-2027 school year calendar.',
  },

  events: calendarData as CalendarEvent[],
};
