import type { Metadata } from 'next';
import { site } from '@content/site';

export const metadata: Metadata = {
  title: site.name,
  robots: { index: false },
};

/**
 * Racine du site : renvoie vers la version anglaise si le téléphone est en anglais,
 * sinon vers la version française. Sans JavaScript, le lien et le renvoi automatique prennent le relais.
 */
export default function RootPage() {
  const script = "location.replace((navigator.language||'fr').toLowerCase().startsWith('en')?'/en/':'/fr/')";
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/fr/" />
      </noscript>
      <p>
        <a href="/fr/">{site.name} · Français</a>
        {' · '}
        <a href="/en/" lang="en">
          English
        </a>
      </p>
    </main>
  );
}
