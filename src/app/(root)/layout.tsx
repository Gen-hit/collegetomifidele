import type { ReactNode } from 'react';

/** Gabarit minimal de la racine du site, qui ne sert qu'à renvoyer vers /fr ou /en. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
