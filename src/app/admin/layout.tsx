import '@fontsource-variable/figtree';
import '@fontsource/zilla-slab/600.css';
import '@fontsource/zilla-slab/700.css';
import '../globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '@content/site';
import { AdminSessionProvider } from '@/admin/session';

export const metadata: Metadata = {
  title: { default: `Administration · ${site.name}`, template: `%s · Administration` },
  // L'administration n'apparaît jamais dans les moteurs de recherche.
  robots: { index: false, follow: false },
  icons: { icon: site.logo.src },
};

export const viewport: Viewport = { themeColor: '#29235c' };

/** Racine des écrans d'administration (/admin) : en français, sans l'en-tête ni le pied de page du site public. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AdminSessionProvider>{children}</AdminSessionProvider>
      </body>
    </html>
  );
}
