import { Quote } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';
import { LightboxTrigger } from '@/components/ui/lightbox';
import { PhotoSlot } from '@/components/ui/photo-slot';
import type { Block, Inline } from '@/lib/article';
import { cn } from '@/lib/utils';

function InlineText({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'bold') return <strong key={index} className="font-semibold">{part.text}</strong>;
        if (part.type === 'link') {
          const className = 'font-semibold text-blue-600 underline underline-offset-4 hover:text-navy-700';
          // Un lien vers une page du site passe par le routeur ; les autres s'ouvrent dans un nouvel onglet.
          return part.href.startsWith('/') ? (
            <Link key={index} href={part.href} className={className}>
              {part.text}
            </Link>
          ) : (
            <a key={index} href={part.href} className={className} {...(part.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {part.text}
            </a>
          );
        }
        return <Fragment key={index}>{part.text}</Fragment>;
      })}
    </>
  );
}

type ArticleBodyProps = {
  /** Le texte de l'article, découpé par `parseArticle` (src/lib/article.ts). */
  blocks: Block[];
  photoWord: string;
  /** Proportion annoncée dans les emplacements de photo : « 4:3 ». */
  photoRatio: string;
  /**
   * Position de la première photo du texte dans la visionneuse de la page (le `LightboxGroup` qui entoure l'article).
   * La photo de couverture occupe la position 0, d'où 1 par défaut.
   */
  imageOffset?: number;
};

/** Le corps d'un article : paragraphes, intertitres, citations, listes et photos. */
export function ArticleBody({ blocks, photoWord, photoRatio, imageOffset = 1 }: ArticleBodyProps) {
  // Chaque photo du texte reçoit sa position dans la visionneuse, dans l'ordre de lecture.
  let position = imageOffset;

  return (
    <div className="flex flex-col gap-6 text-[17px] leading-[30px]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={index} className="mt-2 font-display text-2xl leading-8 font-bold text-balance text-navy-700 sm:text-[28px] sm:leading-9">
                {block.text}
              </h2>
            );
          case 'quote':
            return (
              <figure key={index} className="relative flex flex-col gap-3 rounded-2xl border-l-4 border-gold-400 bg-surface-alt p-5 pl-6 sm:p-7">
                <Quote aria-hidden="true" className="size-7 text-gold-400" strokeWidth={1.75} />
                <blockquote className="font-display text-xl leading-[30px] font-semibold text-pretty">
                  <InlineText parts={block.content} />
                </blockquote>
                {block.author ? <figcaption className="text-[15px] leading-6 font-semibold text-muted">— {block.author}</figcaption> : null}
              </figure>
            );
          case 'list':
            return (
              <ul key={index} className="flex flex-col gap-2.5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-[11px] size-2 shrink-0 rounded-full bg-gold-400" />
                    <span>
                      <InlineText parts={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case 'images':
            return (
              <div key={index} className={cn('grid gap-3', block.images.length > 1 && 'sm:grid-cols-2')}>
                {block.images.map((image, imageIndex) => (
                  <figure key={imageIndex} className="flex flex-col gap-2">
                    <LightboxTrigger index={position++} className="overflow-hidden rounded-2xl">
                      <PhotoSlot
                        label={`${image.caption} · ${photoRatio}`}
                        src={image.src ?? undefined}
                        alt={image.caption}
                        photoWord={photoWord}
                        ratio={block.images.length > 1 ? 'aspect-4/3' : 'aspect-video'}
                      />
                    </LightboxTrigger>
                    {image.src && image.caption ? <figcaption className="text-sm leading-5 text-muted">{image.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            );
          default:
            return (
              <p key={index} className="text-pretty">
                <InlineText parts={block.content} />
              </p>
            );
        }
      })}
    </div>
  );
}
