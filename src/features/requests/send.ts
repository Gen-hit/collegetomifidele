/**
 * Envoi d'une demande des familles (préinscription, message) au back-office.
 *
 * Un seul appel, sans compte : la fonction `submit_family_request` de la base vérifie les champs,
 * écarte les robots, limite les envois répétés et numérote les préinscriptions.
 * Pas de bibliothèque Supabase ici : un simple `fetch`, pour garder les pages publiques légères.
 *
 * Sans adresse Supabase au moment de la construction, `familyRequestsEnabled` vaut `false` :
 * les formulaires reviennent à l'envoi par WhatsApp seul, comme avant le back-office.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const school = process.env.NEXT_PUBLIC_SCHOOL_SLUG || 'tomi-fidele';

export const familyRequestsEnabled = Boolean(url && key);

export type RequestKind = 'preinscription' | 'contact';

export type SendResult =
  | { ok: true; reference: string | null }
  | { ok: false; reason: 'network' | 'throttled' | 'invalid' | 'server' };

export async function sendFamilyRequest(
  kind: RequestKind,
  data: Record<string, unknown>,
  options: { trap: string; startedAt: number },
): Promise<SendResult> {
  if (!familyRequestsEnabled) return { ok: false, reason: 'server' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${url}/rest/v1/rpc/submit_family_request`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_school: school,
        p_kind: kind,
        p_data: data,
        p_trap: options.trap,
        p_elapsed_ms: Math.min(Date.now() - options.startedAt, 86_400_000),
      }),
      signal: controller.signal,
    });
    if (response.ok) {
      const body = (await response.json().catch(() => ({}))) as { reference?: string | null };
      return { ok: true, reference: body.reference ?? null };
    }
    const error = (await response.json().catch(() => ({}))) as { code?: string };
    if (error.code === '54000') return { ok: false, reason: 'throttled' };
    if (error.code === '22023') return { ok: false, reason: 'invalid' };
    return { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
