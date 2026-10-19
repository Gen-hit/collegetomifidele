import type { Locale } from '@/i18n/config';

/**
 * Point de branchement du mini-assistant.
 *
 * Aujourd'hui l'assistant n'est relié à aucun service : il propose des réponses guidées
 * (messages/*.json → `assistant.topics`) et, pour une question libre, affiche le message
 * par défaut `assistant.fallback`.
 *
 * Pour le brancher plus tard :
 *  1. créer une petite fonction serveur (par exemple une fonction Netlify) qui reçoit la question,
 *     appelle le service choisi et renvoie le texte de la réponse. La clé d'API reste sur le
 *     serveur : elle ne doit jamais apparaître dans ce site statique ;
 *  2. indiquer son adresse dans la variable NEXT_PUBLIC_ASSISTANT_ENDPOINT ;
 *  3. c'est tout : `askAssistant` l'appellera automatiquement.
 */
const endpoint = process.env.NEXT_PUBLIC_ASSISTANT_ENDPOINT;

export const assistantConfigured = Boolean(endpoint);

/** Renvoie la réponse de l'assistant, ou `null` s'il n'est pas configuré ou injoignable. */
export async function askAssistant(question: string, locale: Locale): Promise<string | null> {
  if (!endpoint) return null;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, locale }),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'answer' in data && typeof data.answer === 'string') {
      return data.answer;
    }
    return null;
  } catch {
    return null;
  }
}
