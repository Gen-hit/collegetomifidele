import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Connexion au back-office (Supabase), côté navigateur uniquement.
 *
 * L'adresse du projet et sa clé publique se règlent dans .env.local (en local) ou dans les variables de
 * l'hébergeur : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY. La clé publique ne donne aucun
 * droit par elle-même : tout est contrôlé par les règles d'accès de la base (supabase/migrations/).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const backOfficeConfigured = url.length > 0 && key.length > 0;

/** Le slug de l'établissement, pour les fichiers déposés et le contenu publié. */
export const schoolSlug = process.env.NEXT_PUBLIC_SCHOOL_SLUG || 'tomi-fidele';

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!backOfficeConfigured) throw new Error('Back-office non configuré.');
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'ctf-admin' },
    });
  }
  return client;
}

/** Traduit les messages d'erreur courants de Supabase pour l'équipe du collège. */
export function frenchError(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String((error as { message: unknown }).message) : String(error);
  const message = raw.toLowerCase();
  if (message.includes('invalid login credentials')) return 'Adresse ou mot de passe incorrect.';
  if (message.includes('email not confirmed')) return 'Confirmez d’abord votre adresse : ouvrez le message reçu par email et suivez le lien.';
  if (message.includes('database error saving new user') || message.includes("n'a pas été invitée")) {
    return 'Cette adresse n’a pas été invitée. Demandez une invitation à l’administrateur du site.';
  }
  if (message.includes('user already registered')) return 'Ce compte existe déjà : connectez-vous, ou utilisez « Mot de passe oublié ».';
  if (message.includes('password should be at least')) return 'Le mot de passe doit compter au moins 8 caractères.';
  if (message.includes('rate limit') || message.includes('too many')) return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
  if (message.includes('failed to fetch') || message.includes('network')) return 'Connexion impossible. Vérifiez la connexion internet et réessayez.';
  if (message.includes('jwt expired')) return 'Votre session a expiré. Reconnectez-vous.';
  return raw;
}
