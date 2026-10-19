/**
 * Numéro camerounais : 9 chiffres commençant par 6 (mobile) ou 2 (fixe), avec ou sans indicatif 237.
 * Les espaces, points et tirets sont acceptés à la saisie.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s.\-()]/g, '').replace(/^(\+|00)/, '');
  const local = digits.startsWith('237') && digits.length === 12 ? digits.slice(3) : digits;
  return /^[62]\d{8}$/.test(local) ? `+237${local}` : null;
}
