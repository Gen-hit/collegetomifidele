/**
 * Les textes du collège que l'administration remplit (Réglages > Textes du site).
 *
 * Les fichiers messages/*.json contiennent encore des emplacements entre crochets : « [Nom du Principal] »,
 * « [Club 1 : nom à fournir] »… Chaque texte saisi dans l'administration est rangé dans content/data/texts.json,
 * par langue et par chemin (« pages.principal.letter.paragraphs.0 »), et remplace le texte d'origine à la
 * construction du site. Ce fichier ne contient que des fonctions pures (testées dans lib.test.ts).
 */

export type TextOverrides = { fr: Record<string, string>; en: Record<string, string> };

/** Un emplacement : au moins un passage entre crochets (« [à fournir] », « [00 h 00] »…). */
const placeholder = /\[[^\]\n]{1,400}\]/;

/** Vrai si le texte attend encore un contenu du collège. Une chaîne vide compte comme manquante. */
export function isPending(text: unknown): boolean {
  return typeof text !== 'string' || text.trim() === '' || placeholder.test(text);
}

/** Vrai si le texte est réel (ni vide, ni emplacement). */
export const isFilled = (text: unknown): text is string => !isPending(text);

/** Tous les textes d'un objet, avec leur chemin : [['pages.about.hero.intro', '…'], …]. */
export function flatten(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]];
  if (Array.isArray(value)) return value.flatMap((item, index) => flatten(item, prefix ? `${prefix}.${index}` : String(index)));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => flatten(item, prefix ? `${prefix}.${key}` : key));
  }
  return [];
}

/** Copie de `value` où chaque chemin connu reçoit son texte. Les chemins inconnus sont ignorés. */
export function applyOverrides<T>(value: T, overrides: Record<string, string> | undefined): T {
  if (!overrides || Object.keys(overrides).length === 0) return value;
  const copy = structuredClone(value) as unknown;
  for (const [path, text] of Object.entries(overrides)) {
    if (typeof text !== 'string' || !text.trim()) continue;
    const keys = path.split('.');
    let node = copy as Record<string, unknown> | unknown[];
    let ok = true;
    for (const key of keys.slice(0, -1)) {
      const next = (node as Record<string, unknown>)[key];
      if (!next || typeof next !== 'object') {
        ok = false;
        break;
      }
      node = next as Record<string, unknown>;
    }
    const last = keys.at(-1)!;
    if (ok && typeof (node as Record<string, unknown>)[last] === 'string') (node as Record<string, unknown>)[last] = text;
  }
  return copy as T;
}

/**
 * Les textes à remplir : chaque chemin dont le texte français d'origine contient un emplacement.
 * Le texte anglais vient du même chemin ; le français saisi sert aussi en anglais tant que l'anglais manque.
 */
export type PendingText = { path: string; fr: string; en: string };

export function pendingTexts(fr: unknown, en: unknown): PendingText[] {
  const english = new Map(flatten(en));
  return flatten(fr)
    .filter(([, text]) => placeholder.test(text))
    .map(([path, text]) => ({ path, fr: text, en: english.get(path) ?? '' }));
}

/**
 * Les surcharges d'une langue, prêtes à appliquer. En anglais, un texte français saisi comble un emplacement
 * que l'anglais n'a pas encore : mieux vaut un texte en français qu'un trou ou des crochets.
 * `englishBase` : les textes anglais d'origine, pour ne jamais remplacer un texte anglais déjà réel.
 */
export function overridesFor(locale: 'fr' | 'en', overrides: TextOverrides | undefined, englishBase?: unknown): Record<string, string> {
  if (!overrides) return {};
  const own = Object.fromEntries(Object.entries(overrides[locale] ?? {}).filter(([, t]) => isFilled(t)));
  if (locale === 'fr') return own;
  const base = new Map(flatten(englishBase));
  const fallback = Object.fromEntries(
    Object.entries(overrides.fr ?? {}).filter(([path, t]) => isFilled(t) && !(path in own) && isPending(base.get(path))),
  );
  return { ...fallback, ...own };
}

/**
 * Version publique d'un texte : les passages entre crochets sont retirés. « Des spécialités techniques avec travaux
 * pratiques. [Spécialités à fournir.] » devient « Des spécialités techniques avec travaux pratiques. » ;
 * « [Club 1 : nom à fournir] » devient une chaîne vide, que les composants traitent comme « rien à afficher ».
 */
export function withoutPlaceholders(text: string): string {
  if (!placeholder.test(text)) return text;
  return text
    .replace(/\[[^\]\n]{1,400}\]/g, '')
    .replace(/\s+([,.;:!?»)])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,;:·–—\-.]+|[\s,;:·–—\-]+$/g, '')
    .trim();
}

/** Applique `withoutPlaceholders` à tous les textes d'un objet (dictionnaire d'une langue). */
/**
 * Remplace le jeton `{{school}}` par le nom de l'établissement, partout dans les textes.
 * Les fichiers messages/ ne contiennent donc jamais le nom d'une école en dur : c'est ce qui
 * permet d'ouvrir le même site pour un autre établissement (content/data/school.json).
 */
export function withSchoolName<T>(value: T, name: string): T {
  if (typeof value === 'string') return value.replaceAll('{{school}}', name) as T;
  if (Array.isArray(value)) return value.map((item) => withSchoolName(item, name)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withSchoolName(item, name)])) as T;
  }
  return value;
}

export function cleanPlaceholders<T>(value: T): T {
  if (typeof value === 'string') return withoutPlaceholders(value) as T;
  if (Array.isArray(value)) return value.map((item) => cleanPlaceholders(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanPlaceholders(item)])) as T;
  }
  return value;
}
