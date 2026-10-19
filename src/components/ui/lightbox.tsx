'use client';

import { ChevronLeft, ChevronRight, Download, Expand, ImageIcon, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from 'react';
import { buttonClass } from '@/components/ui/button';
import type { Dictionary } from '@/i18n/dictionaries';
import { fill } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Une image de la visionneuse : une photo, ou une page de document. */
export type LightboxItem = {
  /** Chemin de l'image. `null` : la photo n'est pas encore fournie, la visionneuse montre son emplacement. */
  src: string | null;
  /** Vignette plus légère pour la bande du bas. Par défaut : l'image elle-même. */
  thumb?: string;
  title: string;
  description?: string;
  /** Bouton affiché avec cette image : télécharger le document, par exemple. */
  action?: { href: string; label: string; download?: boolean };
};

export type LightboxLabels = Dictionary['viewer'];

type LightboxContext = { items: LightboxItem[]; labels: LightboxLabels; show: (index: number, opener: HTMLElement) => void };

const Context = createContext<LightboxContext | null>(null);

const roundButton =
  'flex size-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-indigo-950/70 text-white transition-colors hover:bg-white hover:text-navy-700';

type LightboxGroupProps = {
  /** Les images du carrousel, dans l'ordre. Chaque `LightboxTrigger` en ouvre une par sa position. */
  items: LightboxItem[];
  labels: LightboxLabels;
  /** Mot affiché dans un emplacement sans photo : « Photo ». */
  photoWord: string;
  children: ReactNode;
};

/**
 * Visionneuse plein écran avec carrousel : flèches, clavier, balayage du doigt, vignettes, titre et description.
 * On entoure un groupe de photos de `LightboxGroup`, et chaque photo cliquable de `LightboxTrigger`.
 */
export function LightboxGroup({ items, labels, photoWord, children }: LightboxGroupProps) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const count = items.length;
  // Si la liste raccourcit pendant que la visionneuse est ouverte (filtre), on reste sur une image qui existe.
  const index = open === null ? null : Math.min(open, count - 1);
  const current = index === null ? null : items[index];

  const context = useMemo<LightboxContext>(
    () => ({
      items,
      labels,
      show: (position, element) => {
        opener.current = element;
        setOpen(position);
      },
    }),
    [items, labels],
  );

  /** Le carrousel boucle : après la dernière image, on revient à la première. */
  const step = (delta: number) => setOpen((value) => (value === null ? null : (value + delta + count) % count));

  // La vignette de l'image affichée reste visible dans la bande du bas.
  useEffect(() => {
    if (index === null) return;
    strip.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (count < 2) return;
    if (event.key === 'ArrowRight') step(1);
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'Home') setOpen(0);
    if (event.key === 'End') setOpen(count - 1);
  };
  const onTouchEnd = (event: TouchEvent) => {
    if (touchStart.current === null || count < 2) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    // Un balayage franc, pas un simple toucher.
    if (Math.abs(distance) > 48) step(distance < 0 ? 1 : -1);
  };

  return (
    <Context.Provider value={context}>
      {children}
      <Dialog.Root open={current !== null} onOpenChange={(next) => (next ? null : setOpen(null))}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-indigo-950 data-[state=open]:animate-fade" />
          <Dialog.Content
            onKeyDown={onKeyDown}
            onCloseAutoFocus={(event) => {
              // Le clavier revient sur la photo qui a ouvert la visionneuse.
              event.preventDefault();
              opener.current?.focus();
            }}
            className="on-dark fixed inset-0 z-50 flex flex-col text-white outline-none"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 p-3 sm:px-6 sm:py-4">
              <Dialog.Title className="text-[15px] leading-6 font-semibold tabular-nums">
                <span className="sr-only">{labels.title}, </span>
                {index === null ? null : fill(labels.position, { index: index + 1, total: count })}
              </Dialog.Title>
              <div className="flex items-center gap-2">
                {current?.action ? (
                  <a
                    href={current.action.href}
                    {...(current.action.download ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
                    className={buttonClass('gold', 'min-h-12 px-4 text-[15px]')}
                  >
                    <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
                    {current.action.label}
                  </a>
                ) : null}
                <Dialog.Close aria-label={labels.close} className={roundButton}>
                  <X aria-hidden="true" className="size-5.5" strokeWidth={2} />
                </Dialog.Close>
              </div>
            </div>

            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20"
              onTouchStart={(event) => (touchStart.current = event.touches[0].clientX)}
              onTouchEnd={onTouchEnd}
            >
              {current?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={current.src} src={current.src} alt={current.title} className="max-h-full max-w-full animate-pop rounded-xl bg-white object-contain" />
              ) : current ? (
                <div
                  key={current.title}
                  className="flex aspect-4/3 max-h-full w-full max-w-3xl animate-pop flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-sky-400 bg-white/10 p-6 text-center"
                >
                  <ImageIcon aria-hidden="true" className="size-9 text-sky-400" strokeWidth={1.5} />
                  <span className="font-semibold">{photoWord}</span>
                  <span className="text-[15px] leading-6 text-sky-200">{labels.missing}</span>
                </div>
              ) : null}
              {count > 1 ? (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label={labels.previous} className={cn(roundButton, 'absolute top-1/2 left-3 hidden -translate-y-1/2 sm:flex')}>
                    <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={labels.next} className={cn(roundButton, 'absolute top-1/2 right-3 hidden -translate-y-1/2 sm:flex')}>
                    <ChevronRight aria-hidden="true" className="size-6" strokeWidth={2} />
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-3 px-3 pt-3 sm:px-6">
              {count > 1 ? (
                <button type="button" onClick={() => step(-1)} aria-label={labels.previous} className={cn(roundButton, 'sm:hidden')}>
                  <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2} />
                </button>
              ) : null}
              <div aria-live="polite" className="mx-auto flex max-h-32 max-w-3xl flex-1 flex-col gap-1 overflow-y-auto text-center">
                <p className="font-display text-lg leading-6 font-semibold text-pretty">{current?.title}</p>
                <Dialog.Description className={cn('text-[15px] leading-6 text-pretty text-sky-200', !current?.description && 'sr-only')}>
                  {current?.description ?? current?.title}
                </Dialog.Description>
              </div>
              {count > 1 ? (
                <button type="button" onClick={() => step(1)} aria-label={labels.next} className={cn(roundButton, 'sm:hidden')}>
                  <ChevronRight aria-hidden="true" className="size-6" strokeWidth={2} />
                </button>
              ) : null}
            </div>

            {count > 1 ? (
              <div ref={strip} role="group" aria-label={labels.thumbnails} className="flex shrink-0 gap-2 overflow-x-auto p-3 [scrollbar-width:none] sm:justify-center sm:px-6 sm:pb-4 [&::-webkit-scrollbar]:hidden">
                {items.map((item, position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => setOpen(position)}
                    aria-label={fill(labels.goTo, { caption: item.title })}
                    aria-current={position === index}
                    className={cn(
                      'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white/10 transition',
                      position === index ? 'border-gold-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    {item.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumb ?? item.src} alt="" loading="lazy" decoding="async" className="size-full bg-white object-cover" />
                    ) : (
                      <ImageIcon aria-hidden="true" className="size-5 text-sky-400" strokeWidth={1.75} />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-4 shrink-0" />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Context.Provider>
  );
}

type LightboxTriggerProps = {
  /** Position de l'image dans les `items` du groupe. */
  index: number;
  /** La photo ou son emplacement. */
  children: ReactNode;
  className?: string;
  /** Pastille « agrandir » dans le coin de la photo. À retirer si le déclencheur est un bouton de texte. */
  badge?: boolean;
};

/**
 * Rend une photo cliquable : elle s'ouvre dans la visionneuse du `LightboxGroup` qui l'entoure.
 * Hors d'un groupe, le contenu s'affiche tel quel, sans bouton.
 */
export function LightboxTrigger({ index, children, className, badge = true }: LightboxTriggerProps) {
  const context = useContext(Context);
  if (!context || !context.items[index]) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={(event) => context.show(index, event.currentTarget)}
      aria-label={fill(context.labels.open, { caption: context.items[index].title })}
      className={cn('group/zoom relative block w-full cursor-zoom-in text-left', className)}
    >
      {children}
      {badge ? (
        <span
          aria-hidden="true"
          className="absolute right-2.5 bottom-2.5 flex size-9 items-center justify-center rounded-full bg-white/95 text-navy-700 shadow-card transition duration-200 group-hover/zoom:scale-110 group-hover/zoom:bg-gold-400 group-hover/zoom:text-ink"
        >
          <Expand className="size-4.5" strokeWidth={2} />
        </span>
      ) : null}
    </button>
  );
}
