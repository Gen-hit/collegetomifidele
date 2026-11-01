// Fonction serveur « eduflow-sync » : la porte d'entrée du logiciel EduFlow installé au collège.
//
// EduFlow s'identifie avec la clé de liaison créée dans Réglages > EduFlow (en-tête X-EduFlow-Token).
// La clé n'ouvre que ce qui suit, pour l'établissement auquel elle appartient :
//   ping                    vérifier la liaison ;
//   preinscriptions.pull    lire les préinscriptions reçues sur le site ;
//   preinscriptions.ack     renvoyer leur suite (contactée, acceptée, refusée) ;
//   calendar.propose        proposer des dates du calendrier ;
//   fees.propose            proposer la grille des frais.
// Les propositions ne sont jamais publiées ici : elles attendent la validation dans « À valider ».
//
// Déploiement (une fois) : supabase functions deploy eduflow-sync --no-verify-jwt
// (EduFlow n'a pas de compte utilisateur : c'est la clé de liaison qui l'identifie, vérifiée ci-dessous.)

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-eduflow-token, content-type',
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

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, max) : '';
const isDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const amount = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100_000_000 ? Math.round(value) : null;

const CATEGORIES = ['term', 'evaluation', 'exam', 'holiday', 'international', 'openDay', 'culture', 'meeting'];
const CALENDAR_FIELDS = ['key', 'category', 'start_date', 'end_date', 'title_fr', 'title_en', 'note_fr', 'note_en', 'confirm'] as const;

type Row = Record<string, unknown>;

/** JSON à clés triées : jsonb ne garde pas l'ordre des clés, une comparaison brute verrait toujours une différence. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Row).sort().map((k) => `${JSON.stringify(k)}:${canonical((value as Row)[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** Une ligne en ligne reçoit une proposition ; une ligne pas encore en ligne est mise à jour et soumise. */
async function propose(db: SupabaseClient, table: string, schoolId: string, match: Row, fields: Row): Promise<'created' | 'proposed' | 'unchanged' | 'conflict' | 'missing'> {
  const { data: current, error } = await db.from(table).select('*').eq('school_id', schoolId).match(match).maybeSingle();
  if (error) throw error;
  const now = new Date().toISOString();
  if (!current) {
    // Un réglage (frais…) jamais enregistré sur le site : pas de ligne à proposer. Le Principal
    // l'enregistre une première fois dans l'administration, puis EduFlow pourra proposer.
    if (table === 'content_blocks') return 'missing';
    const { error: insertError } = await db.from(table).insert({ ...fields, school_id: schoolId, status: 'submitted', updated_at: now });
    if (insertError) throw insertError;
    return 'created';
  }
  const same = Object.entries(fields).every(([k, v]) => canonical(current[k]) === canonical(v));
  if (current.status === 'published' && !current.deleted_at) {
    const pendingSame = current.pending && canonical(current.pending) === canonical(fields);
    if (same || pendingSame) return 'unchanged';
    // Une proposition de l'équipe (ou une demande d'archivage) attend déjà le Principal : on ne l'écrase pas.
    if (current.pending && (current.pending_by || (current.pending as Row)._archive)) return 'conflict';
    const { error: updateError } = await db.from(table)
      .update({ pending: fields, pending_by: null, pending_at: now }).eq('id', current.id);
    if (updateError) throw updateError;
    return 'proposed';
  }
  if (same && current.status === 'submitted' && !current.deleted_at) return 'unchanged';
  const { error: updateError } = await db.from(table)
    .update({ ...fields, status: 'submitted', deleted_at: null, updated_at: now }).eq('id', current.id);
  if (updateError) throw updateError;
  return 'proposed';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return reply(405, { message: 'Méthode non autorisée.' });

  const token = req.headers.get('x-eduflow-token') ?? '';
  if (!/^efs_[0-9a-f]{48}$/.test(token)) return reply(401, { message: 'Clé de liaison absente ou mal recopiée.' });

  const db = createClient(Deno.env.get('SUPABASE_URL')!, key('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  const { data: link } = await db.from('eduflow_links').select('id, school_id')
    .eq('token_hash', await sha256(token)).is('revoked_at', null).maybeSingle();
  if (!link) return reply(401, { message: 'Clé de liaison inconnue ou remplacée. Créez-en une nouvelle dans Réglages > EduFlow.' });
  const schoolId = link.school_id as string;
  await db.from('eduflow_links').update({ last_used_at: new Date().toISOString() }).eq('id', link.id);

  let body: Row;
  try {
    body = await req.json();
  } catch {
    return reply(400, { message: 'Requête illisible.' });
  }
  const action = String(body.action ?? '');

  try {
    switch (action) {
      case 'ping': {
        const { data: school } = await db.from('schools').select('name, slug').eq('id', schoolId).single();
        return reply(200, { ok: true, school });
      }

      case 'preinscriptions.pull': {
        let query = db.from('preinscriptions')
          .select('id, reference, student_name, birth_date, target_class, section, stream, previous_school, parent_name, parent_phone, parent_email, message, locale, status, created_at, updated_at')
          .eq('school_id', schoolId).is('deleted_at', null).order('updated_at').order('id').limit(200);
        // Curseur (date de modification, id) : reprend exactement après la dernière ligne reçue,
        // même si des centaines de lignes partagent la même date.
        if (typeof body.since === 'string' && !Number.isNaN(Date.parse(body.since))) {
          const since = new Date(body.since).toISOString();
          const afterId = typeof body.after_id === 'string' && /^[0-9a-f-]{36}$/i.test(body.after_id) ? body.after_id : null;
          query = afterId
            ? query.or(`updated_at.gt.${since},and(updated_at.eq.${since},id.gt.${afterId})`)
            : query.gte('updated_at', since);
        }
        else query = query.in('status', ['new', 'contacted']);
        const { data, error } = await query;
        if (error) throw error;
        return reply(200, { ok: true, items: data ?? [] });
      }

      case 'preinscriptions.ack': {
        const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
        let updated = 0;
        for (const item of items as Row[]) {
          const status = String(item.status ?? '');
          if (!['contacted', 'accepted', 'rejected'].includes(status)) continue;
          const note = text(item.note, 500);
          const reference = text(item.reference, 40);
          const { data: found, error: readError } = await db.from('preinscriptions').select('id, internal_note')
            .eq('school_id', schoolId).eq('reference', reference).is('deleted_at', null).maybeSingle();
          if (readError) throw readError;
          if (!found) continue;
          const changes: Row = { status, eduflow_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() };
          // La note du secrétariat est conservée : celle d'EduFlow s'ajoute à la suite.
          if (note && !String(found.internal_note ?? '').includes(`EduFlow : ${note}`)) {
            changes.internal_note = [String(found.internal_note ?? '').trim(), `EduFlow : ${note}`].filter(Boolean).join('\n');
          }
          const { error } = await db.from('preinscriptions').update(changes).eq('id', found.id);
          if (error) throw error;
          updated++;
        }
        return reply(200, { ok: true, updated });
      }

      case 'calendar.propose': {
        const events = Array.isArray(body.events) ? body.events.slice(0, 150) : [];
        const result = { created: 0, proposed: 0, unchanged: 0, skipped: 0, conflict: 0, missing: 0 };
        for (const event of events as Row[]) {
          const k = text(event.key, 60);
          const title = text(event.title_fr, 160);
          const start = isDate(event.start_date) ? event.start_date : null;
          const end = isDate(event.end_date) && start && event.end_date >= start ? event.end_date : null;
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(k) || !title || !CATEGORIES.includes(String(event.category))) {
            result.skipped++;
            continue;
          }
          const fields: Row = {
            key: k, category: event.category, start_date: start, end_date: end, title_fr: title,
            title_en: text(event.title_en, 160), note_fr: text(event.note_fr, 500), note_en: text(event.note_en, 500), confirm: false,
          };
          const outcome = await propose(db, 'calendar_events', schoolId, { key: k },
            Object.fromEntries(CALENDAR_FIELDS.map((f) => [f, fields[f]])));
          result[outcome]++;
        }
        return reply(200, { ok: true, ...result });
      }

      case 'fees.propose': {
        const input = (body.fees ?? {}) as Row;
        const deadlines = Array.isArray(input.deadlines) ? input.deadlines.slice(0, 12).map((d) => (isDate(d) ? d : null)) : [];
        const tuition: Record<string, { instalments: (number | null)[]; byClass?: Record<string, (number | null)[]> }> = {};
        for (const [level, value] of Object.entries((input.tuition ?? {}) as Record<string, Row>)) {
          if (!/^(fr|en)-(general|technical)-[12]$/.test(level)) continue;
          const instalments = Array.isArray(value.instalments) ? value.instalments.slice(0, 12).map(amount) : [];
          const byClass: Record<string, (number | null)[]> = {};
          for (const [cls, list] of Object.entries((value.byClass ?? {}) as Record<string, unknown>)) {
            if (Array.isArray(list) && text(cls, 40)) byClass[text(cls, 40)] = list.slice(0, 12).map(amount);
          }
          tuition[level] = Object.keys(byClass).length ? { instalments, byClass } : { instalments };
        }
        if (!deadlines.length || !Object.keys(tuition).length) return reply(422, { message: 'Grille des frais vide.' });

        const { data: current } = await db.from('content_blocks').select('data, pending')
          .eq('school_id', schoolId).eq('key', 'fees').maybeSingle();
        const base = ((current?.pending as Row | null)?.data ?? current?.data ?? {}) as Row;
        const registration = input.registration as Row | undefined;
        const data = {
          ...base,
          deadlines,
          tuition: { ...((base.tuition ?? {}) as Row), ...tuition },
          registration: registration
            ? { amount: amount(registration.amount), newStudentsOnly: Boolean(registration.newStudentsOnly ?? true) }
            : base.registration ?? { amount: null, newStudentsOnly: true },
          gridPdf: base.gridPdf ?? null,
        };
        const outcome = await propose(db, 'content_blocks', schoolId, { key: 'fees' }, { key: 'fees', data });
        return reply(200, { ok: true, outcome });
      }

      case 'results.propose': {
        const EXAMS = ['bepc', 'cap', 'probatoire', 'baccalaureat', 'gce-ol', 'gce-al', 'gce-tech'];
        const input = Array.isArray(body.sessions) ? body.sessions.slice(0, 15) : [];
        // Mêmes bornes que l'administration du site : une année hors bornes rendrait la page
        // « Résultats » impossible à enregistrer pour le Principal.
        const maxYear = new Date().getFullYear() + 1;
        const byYear = new Map<number, Row>();
        for (const session of input as Row[]) {
          const year = typeof session.year === 'number' && session.year >= 1990 && session.year <= maxYear ? Math.round(session.year) : null;
          if (!year) continue;
          const results: Row = {};
          for (const [exam, value] of Object.entries((session.results ?? {}) as Record<string, Row>)) {
            if (!EXAMS.includes(exam)) continue;
            const registered = amount(value.registered);
            const passed = amount(value.passed);
            if (registered === null || passed === null || registered === 0 || passed > registered) continue;
            results[exam] = { registered, passed };
          }
          if (Object.keys(results).length) byYear.set(year, results); // une seule entrée par année
        }
        const sessions = [...byYear.entries()].map(([year, results]) => ({ year, results })).sort((a, b) => a.year - b.year);
        if (!sessions.length) return reply(422, { message: 'Aucun résultat exploitable.' });

        const { data: current } = await db.from('content_blocks').select('data, pending')
          .eq('school_id', schoolId).eq('key', 'results').maybeSingle();
        const base = ((current?.pending as Row | null)?.data ?? current?.data ?? {}) as Row;
        // Les sessions déjà saisies sur le site sont conservées ; EduFlow remplace celles de ses années.
        const kept = (Array.isArray(base.sessions) ? base.sessions : []).filter(
          (s: Row) => !sessions.some((n) => n.year === s.year),
        );
        const data = { ...base, sessions: [...kept, ...sessions].sort((a: Row, b: Row) => Number(a.year) - Number(b.year)) };
        const outcome = await propose(db, 'content_blocks', schoolId, { key: 'results' }, { key: 'results', data });
        return reply(200, { ok: true, outcome, years: sessions.map((s) => s.year) });
      }

      case 'team.propose': {
        const principalName = text(body.principal, 120) || null;
        const people: Row[] = [];
        for (const person of (Array.isArray(body.others) ? body.others.slice(0, 30) : []) as Row[]) {
          const name = text(person.name, 120);
          const role = (person.role ?? {}) as Row;
          const fr = text(role.fr, 80);
          if (!name || !fr) continue;
          people.push({ name, role: { fr, en: text(role.en, 80) || fr } });
        }
        if (!principalName && !people.length) return reply(422, { message: 'Aucune personne exploitable.' });

        const { data: current } = await db.from('content_blocks').select('data, pending')
          .eq('school_id', schoolId).eq('key', 'team').maybeSingle();
        const base = ((current?.pending as Row | null)?.data ?? current?.data ?? {}) as Row;
        // Les portraits déposés sur le site sont conservés : on les retrouve par le nom.
        const photos = new Map<string, unknown>();
        const basePrincipal = (base.principal ?? {}) as Row;
        if (basePrincipal.name) photos.set(String(basePrincipal.name).toLowerCase(), basePrincipal.photo ?? null);
        for (const p of (Array.isArray(base.others) ? base.others : []) as Row[]) {
          if (p.name) photos.set(String(p.name).toLowerCase(), p.photo ?? null);
        }
        const photoOf = (name: string | null) => (name ? photos.get(name.toLowerCase()) ?? null : null);

        const data = {
          principal: { name: principalName, photo: principalName ? photoOf(principalName) : basePrincipal.photo ?? null },
          others: people.map((p) => ({ ...p, photo: photoOf(String(p.name)) })),
        };
        const outcome = await propose(db, 'content_blocks', schoolId, { key: 'team' }, { key: 'team', data });
        return reply(200, { ok: true, outcome, people: people.length + (principalName ? 1 : 0) });
      }

      default:
        return reply(400, { message: 'Action inconnue.' });
    }
  } catch (cause) {
    console.error(action, cause);
    return reply(500, { message: 'Erreur du site pendant la synchronisation. Réessayez plus tard.' });
  }
});
