/**
 * Emplacements « à fournir ».
 *
 * Le site public ne montre jamais de crochets ni de chiffres fictifs : tant qu'une information manque, le bloc qui
 * en dépend se replie ; il apparaît de lui-même quand le collège la saisit dans l'administration.
 * NEXT_PUBLIC_SHOW_PLACEHOLDERS=true fait réapparaître les emplacements, pour voir la maquette complète.
 */
export const showPlaceholders = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === 'true';

/** Faut-il afficher ce texte ? Oui s'il est réel, ou si les emplacements sont demandés. */
export const shown = (text: string | null | undefined): text is string => Boolean(text && text.trim()) || (showPlaceholders && text !== null && text !== undefined);
