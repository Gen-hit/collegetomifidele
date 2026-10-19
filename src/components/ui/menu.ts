/**
 * Apparence commune des petits menus d'actions (partager, ajouter à l'agenda) et de leur bouton.
 * Les menus eux-mêmes sont des « DropdownMenu » Radix : clavier et lecteurs d'écran sont gérés.
 */
export const actionButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-line bg-white px-3 text-[15px] leading-5 font-semibold ' +
  'text-navy-700 transition-colors hover:border-navy-700 hover:bg-surface-alt data-[state=open]:border-navy-700 data-[state=open]:bg-surface-alt';

export const menuContentClass =
  'z-50 min-w-60 rounded-xl border border-line bg-white p-1.5 text-ink shadow-float data-[state=open]:animate-pop';

export const menuItemClass =
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[15px] leading-5 font-semibold outline-none select-none ' +
  'data-highlighted:bg-sky-100 data-highlighted:text-navy-700';

export const menuLabelClass = 'px-3 pt-2 pb-1 text-[13px] leading-4 font-semibold tracking-[0.06em] text-muted uppercase';
