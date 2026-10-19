import { site } from '@content/site';

/**
 * Affiché pendant qu'une page se charge, si elle tarde : la silhouette d'une page (bandeau, titre, blocs)
 * à la place d'un écran vide. Sur une bonne connexion, les pages sont préchargées et cet écran ne se voit pas.
 */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="animate-fade [animation-delay:150ms]">
      <span className="sr-only">{site.name}</span>
      <div className="on-dark relative overflow-hidden bg-indigo-900 pt-8 pb-14 sm:pb-20">
        <div className="mx-auto flex w-full max-w-6xl animate-shimmer flex-col gap-4 px-4 sm:px-6 lg:px-8">
          <span className="h-4 w-40 rounded-full bg-white/15" />
          <span className="mt-4 h-3 w-28 rounded-full bg-sky-400/50" />
          <span className="h-10 w-4/5 max-w-xl rounded-xl bg-white/20 sm:h-12" />
          <span className="h-5 w-full max-w-2xl rounded-full bg-white/15" />
          <span className="h-5 w-2/3 max-w-lg rounded-full bg-white/15" />
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-gold-400" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl animate-shimmer gap-4 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {[0, 1, 2].map((item) => (
          <span key={item} className="flex h-44 flex-col gap-3 rounded-2xl border border-line bg-surface-alt p-6">
            <span className="size-12 rounded-xl bg-sky-100" />
            <span className="h-5 w-2/3 rounded-full bg-line" />
            <span className="h-4 w-full rounded-full bg-line/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
