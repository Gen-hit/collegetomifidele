// Garde la base Supabase éveillée.
//
// L'offre gratuite de Supabase met le projet en pause après 7 jours sans activité : l'administration ne répond
// plus, les formulaires des familles ne peuvent plus enregistrer, et la mise à jour du site échoue.
// Netlify lance cette fonction chaque jour à 05:17 UTC (06:17 à Douala) : elle lit le contenu publié,
// ce qui suffit à compter comme une activité. Elle ne modifie rien.

export default async () => {
  const url = (Netlify.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '').replace(/\/+$/, '');
  const key = Netlify.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? '';
  const school = Netlify.env.get('NEXT_PUBLIC_SCHOOL_SLUG') || 'tomi-fidele';
  if (!url || !key) {
    console.log('[éveil] Supabase non configuré : rien à faire.');
    return new Response('non configuré');
  }
  const response = await fetch(`${url}/rest/v1/rpc/site_snapshot`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_school: school }),
    signal: AbortSignal.timeout(20_000),
  });
  console.log(`[éveil] Supabase a répondu ${response.status}.`);
  return new Response(String(response.status));
};

export const config = {
  // 05:17 UTC = 06:17 à Douala (UTC+1, pas d'heure d'été).
  schedule: '17 5 * * *',
};
