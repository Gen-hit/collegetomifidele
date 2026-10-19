import { normalizePhone } from '@/lib/phone';

/** Les réponses du formulaire de préinscription. */
export type PreinscriptionValues = {
  student: string;
  section: string;
  stream: string;
  className: string;
  parent: string;
  phone: string;
  message: string;
};

export type FieldName = keyof PreinscriptionValues;

/** Les champs obligatoires laissés vides ou mal remplis. */
export function validate(values: PreinscriptionValues): FieldName[] {
  const invalid: FieldName[] = [];
  if (values.student.trim().length < 3) invalid.push('student');
  if (!values.className) invalid.push('className');
  if (values.parent.trim().length < 3) invalid.push('parent');
  if (!normalizePhone(values.phone)) invalid.push('phone');
  return invalid;
}
