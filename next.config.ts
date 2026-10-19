import type { NextConfig } from 'next';

// Étape 1 : le site est exporté en fichiers statiques (dossier `out/`).
// Aucun serveur n'est nécessaire, ce qui le rend léger et hébergeable partout.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
