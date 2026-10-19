// Fonction serveur « publish » : le bouton « Mettre le site à jour » de l'administration.
//
// 1. La base décide si la personne connectée peut publier maintenant (request_publication) :
//    droit de publication, une demande à la fois, plafond du mois.
// 2. La fonction appelle le crochet de construction de l'hébergeur, gardé secret ici
//    (Edge Functions > Secrets : DEPLOY_HOOK_URL). L'hébergeur reconstruit le site en une à deux minutes.
// 3. Le résultat est noté dans la table `publications`, visible sur le tableau de bord.

import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

function key(json: string, legacy: string): string {
  try {
    const keys = JSON.parse(Deno.env.get(json) ?? '{}');
    if (keys.default) return keys.default;
  } catch {
    // ancien format
  }
  return Deno.env.get(legacy) ?? '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return reply(405, { message: 'Méthode non autorisée.' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const authorization = req.headers.get('Authorization') ?? '';
  const asUser = createClient(url, key('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });

  // La base vérifie les droits et inscrit la demande.
  const { data: request, error } = await asUser.rpc('request_publication');
  if (error || !request) {
    const forbidden = error?.code === '42501';
    return reply(forbidden ? 403 : 409, { message: error?.message ?? 'Demande refusée.' });
  }

  const admin = createClient(url, key('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const mark = (status: 'sent' | 'failed', detail: string) =>
    admin.from('publications').update({ status, detail }).eq('id', request.id);

  const hook = Deno.env.get('DEPLOY_HOOK_URL');
  if (!hook) {
    await mark('failed', 'Crochet de construction non configuré (secret DEPLOY_HOOK_URL).');
    return reply(503, {
      message:
        "La mise à jour automatique n'est pas encore branchée à l'hébergeur. Les changements sont enregistrés ; " +
        "l'administrateur du site doit configurer le lien de construction.",
    });
  }

  try {
    const response = await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      await mark('failed', `L'hébergeur a répondu ${response.status}.`);
      return reply(502, { message: "L'hébergeur n'a pas accepté la demande. Réessayez dans quelques minutes." });
    }
  } catch (cause) {
    await mark('failed', `Hébergeur injoignable : ${String(cause).slice(0, 200)}`);
    return reply(502, { message: "L'hébergeur ne répond pas. Réessayez dans quelques minutes." });
  }

  await mark('sent', 'Construction demandée à l’hébergeur.');
  return reply(200, {
    message: 'Mise à jour lancée. Le site sera à jour dans une à deux minutes.',
    monthCount: (request.monthCount ?? 0) + 1,
    monthlyLimit: request.monthlyLimit,
  });
});
