/**
 * Réduction des photos dans le navigateur, avant l'envoi : une photo de téléphone de 4 à 6 Mo devient un fichier
 * de 150 à 300 Ko. Économie de données en 3G pour la secrétaire, et d'espace dans le stockage gratuit.
 * WebP quand le navigateur sait l'écrire, JPEG sinon (anciens Safari).
 */
export type CompressedImage = { blob: Blob; width: number; height: number; type: string };

export async function compressImage(file: File, maxWidth: number, quality = 0.82): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) throw new Error('Choisissez une photo (JPEG, PNG ou WebP).');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Cette photo ne peut pas être lue. Essayez une photo au format JPEG.');
  }
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Votre navigateur ne permet pas de préparer la photo.');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await encode('image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await encode('image/jpeg');
  if (!blob) throw new Error('La photo n’a pas pu être préparée.');
  return { blob, width, height, type: blob.type };
}
