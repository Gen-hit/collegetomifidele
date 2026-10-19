// Récupère le contenu publié dans le back-office avant chaque construction du site.
//
// Lancé tout seul par `npm run build` (script « prebuild »), ou à la main : `node scripts/pull-content.mjs`.
//
//   • Sans les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY : ne fait rien. Le site se construit avec les
//     fichiers content/data/*.json du projet, comme avant le back-office.
//   • Avec ces variables : demande à la base le contenu publié (fonction site_snapshot), réécrit
//     content/data/news.json, calendar.json, gallery.json et documents.json, ainsi que les réglages du collège
//     (contact, fees, payment, results, team, admissions, photos .json) quand ils ont été enregistrés dans
//     l'administration, et recopie dans public/media/ les photos et PDF déposés. Le site publié ne dépend donc
//     jamais de Supabase.
//   • Si la base ne répond pas, la construction s'arrête : l'hébergeur garde la version en ligne
//     précédente, plutôt que de publier un contenu périmé. PULL_CONTENT_OPTIONAL=1 lève cette règle.
//
// Aucune bibliothèque : seulement fetch, disponible dans Node 20 et plus.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'content', 'data');
const mediaDir = path.join(root, 'public', 'media');

// Les variables se lisent aussi dans .env.local et .env, comme le fait Next.js.
async function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    let text;
    try {
      text = await fs.readFile(path.join(root, name), 'utf8');
    } catch {
      continue;
    }
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}

const log = (message) => console.log(`[contenu] ${message}`);

/** Remplace chaque « storage:<chemin> » par « /media/<chemin> » et note les fichiers à recopier. */
function rewriteStorage(value, files) {
  if (typeof value === 'string') {
    return value.replace(/storage:([A-Za-z0-9][A-Za-z0-9/_.-]*)/g, (_, key) => {
      if (key.includes('..')) throw new Error(`Chemin de fichier refusé : ${key}`);
      files.add(key);
      return `/media/${key}`;
    });
  }
  if (Array.isArray(value)) return value.map((item) => rewriteStorage(item, files));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteStorage(v, files)]));
  }
  return value;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function download(base, key) {
  const target = path.join(mediaDir, key);
  // Les fichiers déposés portent un nom unique : déjà présent, il n'a pas changé.
  if (await exists(target)) return false;
  const url = `${base}/storage/v1/object/public/media/${key.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fichier introuvable dans le stockage (${response.status}) : ${key}`);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
  return true;
}

const BLOCKS = ['contact', 'fees', 'payment', 'results', 'team', 'admissions', 'photos'];

async function readJson(name) {
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir, `${name}.json`), 'utf8'));
  } catch {
    return {};
  }
}

async function writeJson(name, value) {
  const file = path.join(dataDir, `${name}.json`);
  const text = `${JSON.stringify(value, null, 2)}\n`;
  let previous = null;
  try {
    previous = await fs.readFile(file, 'utf8');
  } catch {
    // premier passage
  }
  if (previous !== text) await fs.writeFile(file, text);
  return previous !== text;
}

async function main() {
  await loadEnvFiles();
  // Les mêmes réglages que l'administration : l'adresse du projet et sa clé publique (publishable / anon).
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const school = process.env.SCHOOL_SLUG || 'tomi-fidele';

  if (!base || !key) {
    log('back-office non relié : le site utilise les fichiers content/data/*.json du projet.');
    return;
  }

  const headers = { apikey: key, 'Content-Type': 'application/json' };
  // Ancienne clé « anon » (un jeton JWT) : elle passe aussi dans l'en-tête Authorization.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;

  const response = await fetch(`${base}/rest/v1/rpc/site_snapshot`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_school: school }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`La base a répondu ${response.status} : ${(await response.text()).slice(0, 300)}`);
  }
  const snapshot = await response.json();
  if (!snapshot || snapshot.school !== school) {
    throw new Error(`Établissement « ${school} » introuvable dans la base.`);
  }
  for (const name of ['news', 'calendar', 'gallery', 'documents']) {
    if (!Array.isArray(snapshot[name])) throw new Error(`Réponse incomplète : « ${name} » manque.`);
  }

  // Réglages du collège : chaque bloc enregistré complète le fichier du projet, clé par clé.
  // Un bloc jamais enregistré laisse son fichier tel quel.
  const blocks = {};
  for (const name of BLOCKS) {
    const value = snapshot.blocks?.[name];
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    blocks[name] = { ...(await readJson(name)), ...value };
  }

  const files = new Set();
  const content = rewriteStorage(
    { news: snapshot.news, calendar: snapshot.calendar, gallery: snapshot.gallery, documents: snapshot.documents, ...blocks },
    files,
  );

  let copied = 0;
  for (const file of files) {
    if (await download(base, file)) copied += 1;
  }

  const changed = [];
  for (const [name, value] of Object.entries(content)) {
    if (await writeJson(name, value)) changed.push(name);
  }

  log(
    `${content.news.length} actualités, ${content.calendar.length} dates, ${content.gallery.length} photos, ` +
      `${content.documents.length} documents, ${Object.keys(blocks).length} réglages ; ${files.size} fichiers (${copied} nouveaux) ; ` +
      (changed.length ? `mis à jour : ${changed.join(', ')}.` : 'rien de changé.'),
  );
}

main().catch((error) => {
  console.error(`[contenu] Échec de la récupération : ${error.message}`);
  if (process.env.PULL_CONTENT_OPTIONAL === '1') {
    console.error('[contenu] PULL_CONTENT_OPTIONAL=1 : construction avec les fichiers du projet.');
    return;
  }
  process.exitCode = 1;
});
