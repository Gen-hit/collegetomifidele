/**
 * Lecture du texte d'un article (content/news.ts) : du texte simple découpé en blocs.
 * La syntaxe est volontairement réduite pour qu'une actualité s'écrive sans connaître le HTML :
 *
 *   Un paragraphe par bloc, une ligne vide entre deux blocs.
 *   ## Un intertitre
 *   > Une citation            (dernière ligne « > — Auteur » : la signature)
 *   - une liste à puces       (une ligne par élément)
 *   ![Légende](/photos/x.webp)   une ou deux lignes à la suite ; adresse vide = emplacement de photo
 *   **gras** et [texte d'un lien](https://…)
 */
export type Inline = { type: 'text'; text: string } | { type: 'bold'; text: string } | { type: 'link'; text: string; href: string };

export type Block =
  | { type: 'paragraph'; content: Inline[] }
  | { type: 'heading'; text: string }
  | { type: 'quote'; content: Inline[]; author?: string }
  | { type: 'list'; items: Inline[][] }
  | { type: 'images'; images: { caption: string; src: string | null }[] };

/** Seules ces adresses deviennent des liens : pages du site, sites web, email, téléphone. */
const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
const IMAGE = /^!\[([^\]]*)\]\(([^)]*)\)$/;

/** Repère le gras et les liens dans une ligne de texte. */
export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    const [whole, bold, label, target] = match;
    // Un lien vers une adresse non reconnue reste du texte ordinaire.
    if (bold === undefined && !SAFE_LINK.test(target)) continue;
    if (index > last) parts.push({ type: 'text', text: text.slice(last, index) });
    parts.push(bold !== undefined ? { type: 'bold', text: bold } : { type: 'link', text: label, href: target });
    last = index + whole.length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

/** Découpe le texte d'un article en blocs prêts à afficher. */
export function parseArticle(body: string): Block[] {
  const blocks: Block[] = [];
  const chunks = body
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((chunk) => chunk.split('\n').map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);

  for (const lines of chunks) {
    if (lines.length === 1 && lines[0].startsWith('## ')) {
      blocks.push({ type: 'heading', text: lines[0].slice(3).trim() });
    } else if (lines.every((line) => IMAGE.test(line))) {
      blocks.push({
        type: 'images',
        images: lines.map((line) => {
          const [, caption, src] = line.match(IMAGE) as RegExpMatchArray;
          return { caption: caption.trim(), src: src.trim() || null };
        }),
      });
    } else if (lines.every((line) => line.startsWith('>'))) {
      const texts = lines.map((line) => line.replace(/^>\s?/, ''));
      const signed = texts.length > 1 && /^[—–-]\s+/.test(texts[texts.length - 1]);
      const author = signed ? (texts.pop() as string).replace(/^[—–-]\s+/, '') : undefined;
      blocks.push({ type: 'quote', content: parseInline(texts.join(' ')), author });
    } else if (lines.every((line) => /^[-•]\s+/.test(line))) {
      blocks.push({ type: 'list', items: lines.map((line) => parseInline(line.replace(/^[-•]\s+/, ''))) });
    } else {
      blocks.push({ type: 'paragraph', content: parseInline(lines.join(' ')) });
    }
  }
  return blocks;
}

/** Le texte sans sa mise en forme : pour compter les mots ou remplir une description. */
export function plainText(body: string): string {
  const inline = (parts: Inline[]) => parts.map((part) => part.text).join('');
  return parseArticle(body)
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return block.text;
        case 'paragraph':
        case 'quote':
          return inline(block.content);
        case 'list':
          return block.items.map(inline).join(' ');
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');
}

/** Temps de lecture, à 200 mots par minute, jamais moins d'une minute. */
export function readingMinutes(...texts: string[]): number {
  const words = texts
    .map(plainText)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
