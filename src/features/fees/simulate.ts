import type { Amount, Fees } from '@content/fees';

/** Un enfant dans le simulateur : son niveau, sa classe, et s'il s'inscrit pour la première fois. */
export type Child = { levelId: string; className: string; isNew: boolean };

export type ChildEstimate = {
  /** Frais d'inscription dus pour cet enfant (0 s'il n'en doit pas). */
  registration: Amount;
  /** Montant de chaque tranche. */
  instalments: Amount[];
  /** Scolarité de l'année, hors frais d'inscription. */
  tuition: Amount;
  /** Scolarité + frais d'inscription. */
  total: Amount;
};

export type Estimate = {
  children: ChildEstimate[];
  /** Total des frais d'inscription de la famille. */
  registration: Amount;
  /** Total de chaque tranche, tous enfants confondus. */
  instalments: Amount[];
  /** À régler à l'inscription : frais d'inscription + première tranche. */
  dueAtRegistration: Amount;
  total: Amount;
  /** `false` tant qu'un montant nécessaire au calcul n'est pas publié. */
  complete: boolean;
};

/** Additionne des montants ; le résultat est inconnu (`null`) dès qu'un seul terme l'est. */
export function sum(amounts: Amount[]): Amount {
  let total = 0;
  for (const amount of amounts) {
    if (amount === null) return null;
    total += amount;
  }
  return total;
}

/** Les tranches d'une classe : son tarif propre s'il existe, sinon celui de son niveau. */
export function instalmentsFor(fees: Fees, levelId: string, className: string): Amount[] {
  const count = fees.deadlines.length;
  const tuition = fees.tuition[levelId];
  const amounts = tuition?.byClass?.[className] ?? tuition?.instalments ?? [];
  return Array.from({ length: count }, (_, index) => amounts[index] ?? null);
}

/** Calcule l'échéancier et le total d'une famille. Ne lit que `content/fees.ts` : aucun montant n'est écrit ici. */
export function simulate(children: Child[], fees: Fees): Estimate {
  const perChild: ChildEstimate[] = children.map((child) => {
    const instalments = instalmentsFor(fees, child.levelId, child.className);
    const owesRegistration = child.isNew || !fees.registration.newStudentsOnly;
    const registration = owesRegistration ? fees.registration.amount : 0;
    const tuition = sum(instalments);
    return { registration, instalments, tuition, total: sum([registration, tuition]) };
  });

  const registration = sum(perChild.map((child) => child.registration));
  const instalments = fees.deadlines.map((_, index) => sum(perChild.map((child) => child.instalments[index] ?? null)));
  const total = sum(perChild.map((child) => child.total));

  return {
    children: perChild,
    registration,
    instalments,
    dueAtRegistration: sum([registration, instalments[0] ?? 0]),
    total,
    complete: total !== null,
  };
}

/** Le plus petit total annuel de scolarité parmi les niveaux renseignés : pour afficher « à partir de… ». */
export function lowestTuition(fees: Fees): Amount {
  const totals = Object.values(fees.tuition)
    .map((tuition) => sum(Array.from({ length: fees.deadlines.length }, (_, index) => tuition.instalments[index] ?? null)))
    .filter((total): total is number => total !== null);
  return totals.length > 0 ? Math.min(...totals) : null;
}
