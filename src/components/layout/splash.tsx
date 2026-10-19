import { site } from '@content/site';

/**
 * Script exécuté avant l'affichage : il décide si l'écran d'accueil se montre, puis le retire.
 * - Déjà vu dans cet onglet : il ne s'affiche pas (les pages suivantes s'ouvrent directement).
 * - Sinon : il reste au moins 0,6 s (pour ne pas clignoter), jusqu'à ce que la page et les polices
 *   soient prêtes, et jamais plus de 2 s.
 */
const script = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('ctf-splash')){d.setAttribute('data-splash','off');return}sessionStorage.setItem('ctf-splash','1')}catch(e){}var t=Date.now(),f=0;function hide(){if(f)return;f=1;setTimeout(function(){d.setAttribute('data-splash','done')},Math.max(0,600-(Date.now()-t)))}function ready(){if(document.fonts&&document.fonts.ready){document.fonts.ready.then(hide)}else{hide()}}if(document.readyState!=='loading'){ready()}else{document.addEventListener('DOMContentLoaded',ready)}setTimeout(hide,2000)})();`;

/**
 * Écran d'accueil : le logo, le nom et la devise du collège sur fond bleu nuit, le temps que la page se mette en place.
 * Il masque le moment où les polices et les images arrivent, surtout sur une connexion lente. Styles : `.splash` dans globals.css.
 */
export function Splash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div className="splash" aria-hidden="true">
        <span className="flex size-24 items-center justify-center rounded-3xl bg-white shadow-float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logo.src} alt="" width={56} height={64} className="h-16 w-auto" />
        </span>
        <span className="flex flex-col gap-1.5">
          <span className="font-display text-2xl leading-8 font-bold">{site.name}</span>
          <span className="text-xs leading-4 font-semibold tracking-[0.12em] text-gold-400 uppercase">{site.motto}</span>
        </span>
        <span className="splash-bar" />
      </div>
    </>
  );
}
