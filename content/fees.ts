import feesData from './data/fees.json';
import paymentData from './data/payment.json';

/**
 * Les frais du collège : la seule source des montants affichés sur le site.
 * La grille, le simulateur et le bandeau « Admissions » de l'accueil lisent ce fichier.
 *
 * RÈGLE : aucun montant inventé. Tant qu'une valeur vaut `null`, le site affiche « [à fournir] ».
 * Les montants s'écrivent en francs CFA, sans espace ni point : 150000.
 *
 * D'OÙ VIENNENT LES DONNÉES : montants, échéances et grille PDF sont dans content/data/fees.json
 * (Réglages > Frais de scolarité) ; numéros Mobile Money et paiement au secrétariat dans content/data/payment.json
 * (Réglages > Paiement, réservé à l'administrateur du site). L'administration réécrit ces fichiers à chaque mise à jour.
 */
export type Amount = number | null;

export type Tuition = {
  /** Un montant par tranche, dans l'ordre des échéances ci-dessous. */
  instalments: Amount[];
  /**
   * Facultatif : un tarif différent pour certaines classes du niveau (souvent les classes d'examen).
   * Exemple : byClass: { '3e': [60000, 40000, 30000] }
   */
  byClass?: Record<string, Amount[]>;
};

type FeesData = {
  deadlines: (string | null)[];
  registration: { amount: Amount; newStudentsOnly: boolean };
  tuition: Record<string, Tuition>;
  gridPdf: string | null;
};
type PaymentData = { mobileMoney: { id: string; number: string | null; holder: string | null }[]; cashDesk: boolean };

const data = feesData as FeesData;
const payment = paymentData as PaymentData;

/** Les opérateurs proposés ; numéro et titulaire viennent de content/data/payment.json. */
const operators = [
  { id: 'mtn', name: 'MTN Mobile Money', ussd: '*126#' },
  { id: 'orange', name: 'Orange Money', ussd: '#150#' },
];

export const fees = {
  /**
   * Dates limites de paiement des tranches, au format 'AAAA-MM-JJ'.
   * Le nombre de lignes fixe le nombre de tranches ; chaque niveau donne autant de montants.
   */
  deadlines: data.deadlines,

  /** Frais d'inscription. `newStudentsOnly` : payés une seule fois, à la première inscription. */
  registration: data.registration,

  /** Scolarité par niveau. Les identifiants sont ceux de `content/levels.ts`. */
  tuition: data.tuition,

  /** Grille des frais à télécharger (PDF). */
  gridPdf: data.gridPdf,

  /** Paiement par téléphone. `number` au format '6XXXXXXXX' ; `holder` = nom affiché lors du transfert. */
  mobileMoney: operators.map((operator) => {
    const saved = payment.mobileMoney.find((m) => m.id === operator.id);
    return { ...operator, number: saved?.number ?? null, holder: saved?.holder ?? null };
  }),

  /** Le secrétariat encaisse-t-il aussi les paiements en espèces ? */
  cashDesk: payment.cashDesk,
};

export type Fees = typeof fees;
