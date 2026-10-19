import { normalizePhone } from '@/lib/phone';

/** Les réponses du formulaire de contact. */
export type ContactValues = { name: string; phone: string; subject: string; message: string };

export type ContactField = keyof ContactValues;

/** Les champs obligatoires laissés vides ou mal remplis. */
export function validateContact(values: ContactValues): ContactField[] {
  const invalid: ContactField[] = [];
  if (values.name.trim().length < 3) invalid.push('name');
  if (!normalizePhone(values.phone)) invalid.push('phone');
  if (values.message.trim().length < 3) invalid.push('message');
  return invalid;
}
