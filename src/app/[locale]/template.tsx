import type { ReactNode } from 'react';

/**
 * Enveloppe remontée à chaque changement de page : le contenu arrive en fondu.
 * Seule l'opacité est animée, pour ne gêner ni les blocs collants ni les fenêtres.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
