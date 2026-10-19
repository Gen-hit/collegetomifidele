import { supabase } from '../client';
import { contentColumns } from './config';
import { compressImage } from './image';
import type { ContentConfig, ContentRow, ContentTable } from './types';

/**
 * Accès aux contenus depuis l'administration.
 * L'écran envoie toujours la fiche entière ; la base décide de la publication (déclencheur app.guard_content) :
 * sans droit de publication, un contenu en ligne modifié devient une proposition.
 */

export async function listRows(config: ContentConfig): Promise<ContentRow[]> {
  let query = supabase().from(config.table).select('*');
  for (const { column, ascending, nullsFirst } of config.order) query = query.order(column, { ascending, nullsFirst });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ContentRow[];
}

export async function getRow(table: ContentTable, id: string): Promise<ContentRow | null> {
  const { data, error } = await supabase().from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as ContentRow | null) ?? null;
}

/** Ne garde que les colonnes de contenu : l'établissement, les dates de suivi et les propositions restent à la base. */
export function contentPayload(config: ContentConfig, values: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const column of contentColumns(config)) if (column in values) payload[column] = values[column] === '' && !column.endsWith('_en') && !column.endsWith('_fr') ? null : values[column];
  return payload;
}

export async function saveRow(
  config: ContentConfig,
  id: string | null,
  values: Record<string, unknown>,
  status: ContentRow['status'],
): Promise<ContentRow> {
  const payload = { ...contentPayload(config, values), status };
  const db = supabase().from(config.table);
  const { data, error } = id ? await db.update(payload).eq('id', id).select('*').single() : await db.insert(payload).select('*').single();
  if (error) throw error;
  return data as ContentRow;
}

async function patch(table: ContentTable, id: string, values: Record<string, unknown>): Promise<ContentRow> {
  const { data, error } = await supabase().from(table).update(values).eq('id', id).select('*').single();
  if (error) throw error;
  return data as ContentRow;
}

/** Valide une proposition : ses valeurs remplacent la version en ligne (ou l'archivent, si c'était demandé). */
export function approveProposal(config: ContentConfig, row: ContentRow): Promise<ContentRow> {
  const proposal = row.pending ?? {};
  if (proposal._archive) return patch(config.table, row.id, { pending: null, deleted_at: new Date().toISOString() });
  return patch(config.table, row.id, { ...contentPayload(config, proposal), pending: null, status: 'published' });
}

export const rejectProposal = (config: ContentConfig, row: ContentRow) => patch(config.table, row.id, { pending: null });
export const setStatus = (config: ContentConfig, row: ContentRow, status: ContentRow['status']) => patch(config.table, row.id, { status });
export const archiveRow = (config: ContentConfig, row: ContentRow) => patch(config.table, row.id, { deleted_at: new Date().toISOString() });
export const restoreRow = (config: ContentConfig, row: ContentRow) => patch(config.table, row.id, { deleted_at: null });

export async function deleteRow(config: ContentConfig, row: ContentRow): Promise<void> {
  const { error } = await supabase().from(config.table).delete().eq('id', row.id);
  if (error) throw error;
}

/** Échange la place de deux lignes (photos, documents). */
export async function swapPositions(config: ContentConfig, a: ContentRow, b: ContentRow): Promise<void> {
  const column = config.positionColumn;
  if (!column) return;
  let pa = Number(a[column] ?? 0);
  let pb = Number(b[column] ?? 0);
  if (pa === pb) pb = pa + 1;
  [pa, pb] = [pb, pa];
  await patch(config.table, a.id, { [column]: pa });
  await patch(config.table, b.id, { [column]: pb });
}

/** Une adresse de page libre dans la table : « rentree-2026 », sinon « rentree-2026-2 »… */
export async function uniqueSlug(table: ContentTable, column: string, base: string, exceptId: string | null): Promise<string> {
  const root = base || 'sans-titre';
  const { data, error } = await supabase().from(table).select(`id, ${column}`).like(column, `${root}%`);
  if (error) throw error;
  const taken = new Set(((data ?? []) as unknown as Record<string, unknown>[]).filter((r) => r.id !== exceptId).map((r) => String(r[column])));
  if (!taken.has(root)) return root;
  for (let n = 2; ; n += 1) if (!taken.has(`${root}-${n}`)) return `${root}-${n}`;
}

/** « Rentrée 2026 : tout s'est bien passé ! » → « rentree-2026-tout-s-est-bien-passe ». */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

// ── Fichiers ──────────────────────────────────────────────────────────────────────────────

const storageUrl = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')}/storage/v1/object/public/media/`;

/** Adresse affichable d'un fichier : « storage:… » (déposé dans l'administration) ou chemin du site. */
export function fileUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  return value.startsWith('storage:') ? storageUrl + value.slice('storage:'.length) : value;
}

function randomName(): string {
  return crypto.randomUUID().slice(0, 13);
}

async function upload(path: string, body: Blob, contentType: string): Promise<string> {
  const { error } = await supabase().storage.from('media').upload(path, body, { contentType, cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return `storage:${path}`;
}

export type UploadedImage = { src: string; thumb: string | null; width: number; height: number; bytes: number };

/** Réduit la photo dans le navigateur (1 600 px et vignette de 600 px), puis l'envoie. */
/** `withThumb: false` : pas de vignette (photos des réglages, affichées par le site à leur taille). */
export async function uploadImage(file: File, schoolId: string, folder: string, { withThumb = true } = {}): Promise<UploadedImage> {
  const large = await compressImage(file, 1600);
  const name = randomName();
  const ext = large.type === 'image/webp' ? 'webp' : 'jpg';
  const src = await upload(`${schoolId}/${folder}/${name}.${ext}`, large.blob, large.type);
  let thumb: string | null = null;
  if (withThumb) {
    const small = await compressImage(file, 600, 0.78);
    thumb = await upload(`${schoolId}/${folder}/${name}-mini.${ext}`, small.blob, small.type);
  }
  return { src, thumb, width: large.width, height: large.height, bytes: large.blob.size };
}

export const maxPdfBytes = 10 * 1024 * 1024;

export async function uploadPdf(file: File, schoolId: string, folder: string): Promise<string> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Choisissez un fichier PDF.');
  if (file.size > maxPdfBytes) throw new Error('Ce PDF dépasse 10 Mo. Réduisez-le (enregistrer en « taille réduite ») avant de le déposer.');
  const base = slugify(file.name.replace(/\.pdf$/i, '')) || 'document';
  return upload(`${schoolId}/${folder}/${base}-${randomName().slice(0, 6)}.pdf`, file, 'application/pdf');
}
