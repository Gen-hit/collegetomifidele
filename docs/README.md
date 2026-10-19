# Mémoire du projet

La mémoire complète du projet est tenue dans le document Claude
« Collège Tomi Fidele — Mémoire projet », en trois onglets :

- `project_state.md` : tâches par lot, plan du site, décisions, questions ouvertes ;
- `architecture.md` : stack, conventions, couleurs, schéma de données de l'étape 2 ;
- `component_registry.md` : tous les composants, leur fichier et leur rôle.

## État au 7 octobre 2026

- **Fait** : cadrage, design system, maquettes des 11 pages (validées), lot 2 (socle et Accueil),
  lot 3 (Le collège, Mot du Principal, Programmes, les deux sections, Enseignement technique, Infrastructures),
  lot 4 (Admissions avec préinscription vers WhatsApp, Frais et paiement avec simulateur, Résultats aux examens),
  lot 5 (Vie scolaire, Calendrier scolaire avec partage et ajout à l'agenda, Actualités et page d'article,
  Galerie, Documents, Contact),
  lot 6 (Confidentialité, page introuvable, aperçus de lien, données pour Google, plan du site, réglages Netlify,
  relecture de l'anglais, mesure en 3G) et retours du 7 octobre (visionneuse de photos partout, aperçu des documents,
  écran d'accueil et barre de chargement, calendrier interne proposé, trimestres calés sur les congés).
- **Reste à faire par le collège** : contenus entre crochets, photos, validation des dates « À confirmer »,
  publication sur Netlify (voir le README, « Mise en ligne »).
- **Étape 2 : back-office dédié** (décidé le 12 oct.). Lot B1 fait : base Supabase (schéma, règles d'accès, rôles,
  contenu actuel importé), contenus sortis du code vers `content/data/*.json`, récupération au build, `/admin`
  (connexion, tableau de bord, mise à jour du site). Lot B2 fait : saisie des actualités, du calendrier, de la galerie et des documents, validation par le Principal. Suivants : B3 demandes, B4 réglages, B5 recette.

## Décisions à connaître avant de coder

- Site statique (`output: 'export'`), bilingue, routes `/fr` et `/en` aux chemins identiques.
- Couleurs du logo plus un accent doré ; francophone en bleu, anglophone en vert, technique en doré.
- Aucune donnée du collège en dur dans un composant ; aucun chiffre ni témoignage inventé.
- Animations en CSS, carte chargée à la demande, polices hébergées avec le site.
- L'assistant n'est relié à aucun service : voir `src/features/assistant/provider.ts`.
- Textes : `messages/<langue>.json` (commun) et `messages/<langue>/<page>.json` (une page) ; photos dans `content/photos.ts` ; personnes dans `content/team.ts`.
- Une page intérieure = `PageHero` (avec fil d'Ariane) + blocs de `components/sections/` + `CtaBand` ; ses métadonnées viennent de `pageMetadata()`.
- Aucune nouvelle dépendance npm sans nécessité : l'installation doit rester possible sur une connexion instable.
- Données chiffrées dans `content/` (`fees.ts`, `admissions.ts`, `results.ts`, `levels.ts`) ; les calculs sont des fonctions pures (`features/fees/simulate.ts`, `features/results/stats.ts`), sans montant ni taux écrit dans un composant.
- Un formulaire n'envoie rien à un serveur : il compose un message et ouvre WhatsApp.
- Contenus qui vivent dans l'année : `content/calendar.ts`, `content/news.ts`, `content/gallery.ts`, `content/documents.ts`. Une faute de saisie (date impossible, identifiant en double) arrête la construction avec un message en français.
- Le site est construit à l'avance : tout ce qui dépend de la date du jour (prochaines dates, dates passées) se recalcule chez le visiteur avec `useToday()` (`src/lib/hooks.ts`).
- Les libellés de dates sont préparés côté serveur (`features/calendar/events.ts`) ; les composants interactifs ne font que comparer des dates 'AAAA-MM-JJ'.
- Partage : `ShareRow` et `ShareMenu` (`components/ui/share-buttons.tsx`) ; l'adresse partagée est celle que le visiteur voit (`useOrigin()`), pas celle de `content/site.ts`.
- Agenda : fichiers .ics et liens Google Agenda fabriqués par `src/lib/ics.ts`, sans bibliothèque.
- Texte d'un article : syntaxe réduite lue par `src/lib/article.ts` (paragraphes, `## `, `> `, `- `, `![légende](photo)`, gras, liens).
- Typographie française : `typo()` rend insécable l'espace devant « : ; ? ! » ; elle est appliquée à tous les textes français dans `src/i18n/dictionaries.ts`.
- Visionneuse : `LightboxGroup` et `LightboxTrigger` (`components/ui/lightbox.tsx`) ; un groupe = un carrousel. La galerie, les infrastructures, les clubs, les articles et les documents l'utilisent.
- Documents : `file` et `preview` acceptent une valeur par langue (`Localized<T>`, `localize()` dans `content/documents.ts`).
- Chargement : écran d'accueil (`layout/splash.tsx`, script en ligne, une fois par onglet), barre de progression (`layout/navigation-progress.tsx`), fondu de page (`[locale]/template.tsx`), squelette (`[locale]/loading.tsx`).
- Référencement : `pageMetadata()` et `shareImage()` (`lib/metadata.ts`), fiche du collège pour Google (`lib/structured.ts`), `app/sitemap.ts`, `app/robots.ts`. Une page ne met jamais `robots: undefined` (cela efface la règle du layout).
- Netlify : renvois et en-têtes dans `public/_redirects` et `public/_headers`, pour qu'ils s'appliquent aussi au dépôt manuel du dossier `out/`.
- Une ancre ne porte pas la classe `reveal`. Le bouton d'aide flottant reste une pastille sans texte sous 1 536 px de large.
- Back-office : Supabase (`supabase/`) ; le site lit le contenu publié au build via `site_snapshot()` (`scripts/pull-content.mjs`), jamais en direct. Le format de `content/data/*.json` est le contrat : EduFlow pourra fournir le même.
- Publication : le déclencheur `app.guard_content()` décide en base (proposition `pending` si on ne peut pas publier). Le client envoie toujours la ligne entière.
- `/admin` : pages client sous `src/app/admin/`, session dans `src/admin/session.tsx`, cadre `AdminShell`. Le client Supabase n'est chargé que sur ces pages.
- Contenus de l'administration : un seul moteur (`src/admin/content/`) piloté par `config.ts` (champs, liste, adresse sur le site). Ajouter un contenu = une configuration + deux pages de trois lignes. Les pages de fiche lisent `?id=` (export statique).
- Photos réduites dans le navigateur (`image.ts`, WebP 1 600 px + vignette 600 px, JPEG si WebP impossible) avant l'envoi au stockage `media`.
