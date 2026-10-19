# Site du Collège Tomi Fidele

Site vitrine bilingue (français et anglais) du Collège Tomi Fidele, collège d'enseignement
général et technique. Étape 1 : un site entièrement statique, sans base de données ni serveur.

## Démarrer

Il faut [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install      # une seule fois : installe les bibliothèques
npm run dev      # lance le site sur http://localhost:3000
```

Autres commandes :

```bash
npm run build    # construit le site dans le dossier out/
npm run preview  # sert le dossier out/ pour vérifier le résultat final
npm run typecheck
```

## Où modifier quoi

| Je veux changer… | Fichier |
| --- | --- |
| Téléphones, WhatsApp, email, adresse, réseaux sociaux, chiffres clés | `/admin` > Réglages > Coordonnées (ou `content/data/contact.json`) |
| Le menu et ses sous-liens | `content/navigation.ts` |
| Les frais : inscription, tranches par niveau, dates limites | `/admin` > Réglages > Frais (ou `content/data/fees.json`) |
| Les numéros MoMo et Orange Money | `/admin` > Réglages > Paiement, administrateur seulement (ou `content/data/payment.json`) |
| L'année scolaire et les dates des concours d'entrée | `/admin` > Réglages > Admissions (ou `content/data/admissions.json`) |
| Les résultats aux examens (inscrits et admis par session) | `/admin` > Réglages > Résultats (ou `content/data/results.json`) |
| Les classes proposées dans chaque section | `content/levels.ts` |
| Les dates du calendrier scolaire | `/admin` (ou `content/data/calendar.json` sans back-office) |
| Les actualités (titre, date, texte, photo de couverture) | `/admin` (ou `content/data/news.json`) |
| Les photos de la galerie | `/admin` (ou `content/data/gallery.json` + `public/photos/galerie/`) |
| Les documents à télécharger | `/admin` (ou `content/data/documents.json` + `public/documents/`) |
| Les heures d'ouverture du secrétariat | `/admin` > Réglages > Coordonnées |
| Une photo (remplacer un emplacement par la vraie image) | `/admin` > Réglages > Photos du site (ou `content/data/photos.json` + `public/photos/`) |
| Le Principal et l'équipe de direction (nom, fonction, portrait) | `/admin` > Réglages > Équipe (ou `content/data/team.json`) |
| Le menu, l'accueil, le pied de page, l'assistant (français) | `messages/fr.json` |
| Les textes d'une page (français) | `messages/fr/<page>.json` |
| Les mêmes textes en anglais | `messages/en.json` et `messages/en/<page>.json` |
| Les couleurs et les polices | `src/app/globals.css` |
| Le logo | `public/brand/ctf-logo.png` |

Fichiers de textes par page :

| Page | Fichier (dans `messages/fr/` et `messages/en/`) |
| --- | --- |
| Le collège | `about.json` |
| Mot du Principal | `principal.json` |
| Programmes | `programmes.json` |
| Section francophone et Anglophone section | `sections.json` |
| Enseignement technique | `technique.json` |
| Infrastructures | `facilities.json` |
| Admissions (procédure, pièces, questions fréquentes, formulaire) | `admissions.json` |
| Frais et paiement, simulateur | `fees.json` |
| Résultats aux examens | `results.json` |
| Vie scolaire (clubs, horaires de cours, règlement) | `campus.json` |
| Calendrier scolaire (titres, catégories, boutons) | `calendar.json` |
| Actualités (titres de page, rubriques) | `news.json` |
| Galerie photo (thèmes, filtres) | `gallery.json` |
| Documents (rubriques, boutons) | `documents.json` |
| Contact (cartes, formulaire, sujets proposés) | `contact.json` |
| Confidentialité | `privacy.json` |

Les libellés de la visionneuse de photos et de la page « introuvable » sont dans le fichier commun (`viewer` et `notFound`).

Dans un titre, les mots entre accolades sont mis en couleur : `"Section {francophone}"`.

### Publier les frais

Dans `/admin` > Réglages > Frais de scolarité (ou, sans back-office, dans `content/data/fees.json` : chaque `null`
remplacé par le montant en francs CFA, sans espace : `150000`).
La grille, le simulateur et le bandeau de l'accueil se mettent à jour ensemble. Une classe d'examen
plus chère se déclare avec `byClass` (un exemple est donné dans le fichier).

### Publier une session de résultats

Dans `/admin` > Réglages > Résultats aux examens, « Ajouter une session », puis saisir pour chaque examen
le nombre d'inscrits et le nombre d'admis (sans back-office : `content/data/results.json`, forme décrite dans
`content/results.ts`). Le site calcule les taux, l'évolution et le taux global.
Une saisie impossible (plus d'admis que d'inscrits) arrête `npm run dev` avec un message qui indique la ligne à corriger.

### Activer la préinscription par WhatsApp

Avec le back-office relié, la préinscription est enregistrée pour le secrétariat ; le numéro WhatsApp (Réglages >
Coordonnées) ajoute seulement le bouton « Prévenir aussi sur WhatsApp ». Sans back-office :

Renseigner `whatsapp` dans `content/data/contact.json`, au format `2376XXXXXXXX`. Tant que ce numéro manque,
le formulaire propose de copier le message au lieu d'ouvrir WhatsApp.

### Ajouter une date au calendrier

Dans `content/calendar.ts`, copier une ligne de `events` et changer l'identifiant, le titre (français et anglais),
la catégorie et la date :

```ts
{ id: 'portes-ouvertes', category: 'openDay', start: '2027-02-06', title: { fr: 'Journée portes ouvertes', en: 'Open day' } },
```

- Plusieurs jours : ajouter `end: '2027-02-08'` (dernier jour inclus).
- Date pas encore connue : `start: null`. L'événement apparaît dans « Dates à confirmer ».
- Une précision (heure, lieu, classes) : `note: { fr: '…', en: '…' }`.
- L'identifiant sert de lien de partage (`…/calendar/#evt-portes-ouvertes`) : ne plus le changer une fois la date publiée.

D'où viennent les dates déjà saisies (le détail est en tête du fichier) :

- **Dates nationales** (rentrée, congés, fin d'année) : arrêté MINEDUB-MINESEC du 14 août 2026 tel que la presse l'a publié.
  **Les vérifier sur le document officiel avant la mise en ligne.**
- **Trimestres** : le premier s'achève au départ en congés de Noël, le deuxième au départ en congés de Pâques.
  La presse rapporte un autre découpage administratif (premier trimestre clos fin novembre) : la direction tranche.
- **Calendrier interne** (évaluations séquentielles, examens blancs, conseils de classe, bulletins, réunions de parents,
  portes ouvertes, semaine culturelle) : des **propositions**, toutes marquées `confirm: true`. Le site les affiche avec
  la mention « À confirmer ». La direction corrige la date puis retire `confirm: true`.
- **Examens officiels et fêtes à date lunaire** : `start: null` tant que la date n'est pas publiée.

La page « Vie scolaire » affiche d'elle-même les trois prochaines dates.

Le calendrier à imprimer (`public/documents/calendrier-scolaire-2026-2027-fr.pdf` et sa version anglaise) est une
photographie de ce fichier au 7 octobre 2026 : il est à refaire quand les dates changent.

### Publier une actualité

Dans `content/news.ts`, copier un bloc de `articles`, puis remplir l'adresse (`slug`), la date, la rubrique, le titre,
le résumé et le texte, en français et en anglais. Le texte s'écrit simplement :

```
Un paragraphe par bloc, une ligne vide entre deux blocs.

## Un intertitre

> Une citation
> — Son auteur

- une liste à puces

![Légende de la photo](/photos/actualites/remise-des-prix.webp)
```

La photo de couverture (format 16:9) se dépose dans `public/photos/actualites/`. L'accueil affiche les trois dernières actualités.
Les quatre articles `modele-…` montrent la mise en page : les supprimer dès que de vraies actualités existent.

### Ajouter des photos à la galerie

1. Déposer les images dans `public/photos/galerie/` (WebP, 1 600 px de large au maximum).
2. Dans `content/gallery.ts`, remplacer le `null` d'un emplacement par le chemin de l'image, ou ajouter une ligne :
   `{ src: '/photos/galerie/atelier.webp', category: 'workshops', caption: { fr: 'Atelier de menuiserie', en: 'Carpentry workshop' } }`.

Pour une page plus légère sur téléphone, on peut ajouter `thumb` : la même image en 600 px de large, affichée dans la grille.
`description` (facultatif) ajoute une ou deux phrases sous la photo agrandie : date, lieu, classes concernées.

### Mettre un document en ligne

Déposer le PDF dans `public/documents/`, puis, dans `content/documents.ts`, remplacer `file: null` par son chemin
(`'/documents/reglement-interieur.pdf'`) et indiquer la date dans `updated`. Tant que `file` vaut `null`, le document est
annoncé « Bientôt disponible ». La grille des frais se renseigne une seule fois, dans `content/fees.ts` (`gridPdf`).

- **Un fichier par langue** : `file: { fr: '/documents/x-fr.pdf', en: '/documents/x-en.pdf' }`.
- **Aperçu** : `preview` liste une image par page du document (dans `public/documents/apercus/`). Le bouton « Aperçu »
  ouvre alors le document dans la visionneuse, page par page. Sans `preview`, seul « Télécharger » est proposé.

Deux documents sont déjà en ligne : le calendrier scolaire à imprimer et une fiche d'inscription vierge, bilingue.
La fiche est un **modèle** : la direction la valide, ou la remplace par la fiche du collège.

### Ajouter une photo

Avec le back-office : Réglages > Photos du site, « Choisir une photo » sous l'emplacement voulu. Sans back-office :

1. Déposer l'image dans `public/photos/` (format WebP, 1 600 px de large au maximum).
2. Dans `content/data/photos.json`, remplacer `null` par son chemin : `"about.campus": "/photos/campus.webp"`.

L'emplacement en pointillés devient alors la vraie photo, aux mêmes dimensions.

### Photos qui s'agrandissent

Un clic sur une photo l'ouvre en grand, avec sa légende, sa description et un carrousel (flèches, clavier, balayage du doigt,
vignettes). C'est en place sur les Infrastructures, les bandes de photos, les clubs, la galerie, les articles et les documents.
Pour l'ajouter ailleurs : entourer les photos d'un `LightboxGroup` et chaque photo d'un `LightboxTrigger`
(`src/components/ui/lightbox.tsx`, un exemple dans `src/components/sections/photo-strip.tsx`).

Tout ce qui est entre crochets sur le site (`[Nom du Principal]`, `[00 000 F CFA]`…) attend
un contenu du collège. Dans les réglages (et `content/data/*.json`), une valeur vide s'affiche comme un
emplacement « à fournir ».

## Organisation

```
content/      identité du collège, menu, photos, équipe, frais, résultats ; data/ : actualités, calendrier, galerie, documents (JSON)
messages/     textes du site : un fichier commun par langue, puis un fichier par page
public/       logo, photos, documents PDF et leurs aperçus, images de partage (og/), règles Netlify (_redirects, _headers)
src/app/      pages (une par dossier), sous /fr et /en
src/components/
  ui/         briques de base : bouton, titre de section, emplacement photo, étiquette, fil d'Ariane, visionneuse…
  layout/     en-tête, menus, pied de page, bandeau d'annonce, bouton d'aide, écran d'accueil, barre de chargement
  sections/   blocs de page : bandeau de titre, texte + photo, frise, cycles, tableau des classes…
  templates/  gabarits partagés par plusieurs pages (les deux pages de section)
src/features/assistant/   mini-assistant (réponses guidées, branchement futur)
src/features/fees/        simulateur de frais (calcul dans simulate.ts)
src/features/preinscription/   formulaire de préinscription vers WhatsApp
src/features/results/     calcul des taux de réussite
src/features/calendar/    calendrier : agenda, vue de l'année, prochaines dates, ajout à l'agenda
src/features/news/        actualités : classement, article à la une, liste filtrable
src/features/gallery/     galerie : grille filtrable (la visionneuse est dans components/ui/lightbox.tsx)
src/features/contact/     formulaire de contact vers WhatsApp
src/i18n/     gestion des deux langues
src/lib/      code couleur des parcours (tones.ts), liens, référencement (metadata.ts, structured.ts), formats de dates,
              fichiers d'agenda (ics.ts), texte des articles (article.ts)
src/admin/    administration : connexion Supabase, session et rôles, cadre des écrans
src/app/admin/  écrans de /admin : tableau de bord, connexion, À valider, actualites/, calendrier/, galerie/, documents/
src/admin/content/  moteur commun des contenus : réglages des champs (config.ts), liste, fiche, validation, photos
scripts/      pull-content.mjs : récupère le contenu publié avant chaque construction
supabase/     schéma de la base (migrations), import initial (seed), fonction serveur publish
docs/         mémoire du projet : état, architecture, registre des composants
```

## Règles du projet

- Aucun nom, numéro, tarif ou adresse en dur dans un composant : tout vient de `content/` ou de `messages/`.
- Aucun chiffre, tarif ou témoignage inventé : ce qui manque reste un emplacement entre crochets.
- Toute clé ajoutée dans un fichier français doit exister dans le fichier anglais du même nom : sinon `npm run build` s'arrête et indique la clé manquante.
- Code couleur des parcours, partout : section francophone en bleu, section anglophone en vert, enseignement technique en doré (`src/lib/tones.ts`).
- Les noms de classes et d'examens restent dans leur langue d'origine (« 6e », « Form 1 », « Baccalauréat », « GCE A Level »), quelle que soit la langue du site.
- Le site doit rester léger : animations en CSS, carte chargée à la demande, images en WebP.
- Tout ce qui dépend de la date du jour se calcule chez le visiteur (`useToday`) : le site n'a pas besoin d'être reconstruit chaque matin.
- Les identifiants d'événements (`id`) et les adresses d'articles (`slug`) sont des liens partagés : on ne les change plus après publication.
- Une ancre (`id` visé par un lien) ne porte jamais la classe `reveal` : le bloc animé fausse l'arrivée de 20 px.
- Un lien de téléchargement est un `<a download>` simple, jamais un lien de navigation du site.

## Back-office (administration du site)

Le secrétariat et le Principal mettent le site à jour depuis `/admin`, sans toucher au code.
- **B1** : connexion, tableau de bord, bouton « Mettre le site à jour ».
- **B2** : actualités, calendrier, galerie et documents (listes, fiches, photos réduites avant l'envoi, PDF de 10 Mo
  au plus), page « À valider », comparaison champ par champ des propositions, archivage et restauration.
- **B3** : demandes des familles. La préinscription et le formulaire de contact enregistrent la demande (case d'accord
  obligatoire, case piège et délai minimal contre les robots, 5 envois par appareil en 15 minutes, numéro de suivi
  `P26-0001`) ; WhatsApp reste proposé en complément, et en secours si l'envoi échoue. Écran « Demandes des familles » :
  filtres, recherche (nom, numéro, téléphone), fiche avec Appeler / Répondre sur WhatsApp, suite donnée, note interne,
  archivage, export pour Excel. Effacement automatique après 12 mois (fonction `submit_family_request`).
- **B4** : « Réglages » (Principal et administrateur) : coordonnées et chiffres clés, admissions, frais de scolarité,
  paiement (administrateur seulement), résultats aux examens, équipe de direction, photos du site ; validation du
  secrétariat et plafond mensuel. « Journal » : qui a fait quoi. « Comptes » (administrateur) : invitations, rôles,
  suspension d'accès, ménage des fichiers inutilisés du stockage.

Le mode d'emploi pour l'équipe est dans `docs/GUIDE-ADMINISTRATION.md`.

Le parcours type : la secrétaire rédige puis « Envoie au Principal » ; le Principal ouvre « À valider », relit,
« Valide et publie » ; quand plusieurs changements sont validés, il clique « Mettre le site à jour ».
Les photos et PDF déposés vont dans le stockage Supabase (`<école>/<rubrique>/…`) ; un fichier remplacé reste dans le
stockage jusqu'au ménage (Comptes > Ménage du stockage). L'aperçu page par page des PDF déposés n'est pas encore fabriqué : sur le site,
« Aperçu » ouvre alors le PDF.

### Comment ça marche

- **Supabase** (projet `college-tomi-fidele`, région Paris, offre gratuite) garde les contenus, les comptes, les photos
  et les PDF. Le schéma et les règles d'accès sont dans `supabase/migrations/`, la fonction serveur de mise à jour dans
  `supabase/functions/publish/`.
- **Le site reste statique.** Avant chaque construction, `scripts/pull-content.mjs` (lancé tout seul par `npm run build`)
  demande à la base le contenu publié, réécrit `content/data/*.json` (actualités, calendrier, galerie, documents, et les
  réglages : `contact`, `admissions`, `fees`, `payment`, `results`, `team`, `photos`) et recopie les fichiers déposés
  dans `public/media/`. Les fichiers `content/*.ts` lisent ces JSON : ils gardent la structure, les libellés et les règles.
  Le site en ligne ne dépend donc jamais de Supabase.
- **Sans réglages Supabase**, rien ne change : le site se construit avec les fichiers `content/data/*.json` du projet.
- **Trois rôles** : secrétariat (rédige, propose), Principal (valide, publie, met le site à jour), administrateur du site
  (tout, plus les comptes et les numéros de paiement). Une modification du secrétariat sur un contenu en ligne devient une
  proposition : la version en ligne reste jusqu'à validation. Tout est vérifié par la base, pas seulement par l'écran.

### Mettre en route

1. Copier `.env.example` sous le nom `.env.local` : les deux lignes `NEXT_PUBLIC_SUPABASE_…` y sont déjà remplies.
2. Dans Supabase, *Authentication > URL Configuration* :
   - *Site URL* : l'adresse du site (en local `http://localhost:3000`) ;
   - *Redirect URLs* : ajouter `http://localhost:3000/admin/**` et, à la mise en ligne, `https://<adresse du site>/admin/**`.
3. `npm run dev`, puis ouvrir `http://localhost:3000/admin/` > « J'ai reçu une invitation : activer mon compte ».
   Seules les adresses invitées peuvent créer un compte ; la première invitation (administrateur du site) est déjà faite.
4. Confirmer l'adresse depuis le message reçu, puis se connecter.

### Brancher le bouton « Mettre le site à jour »

Le bouton demande une reconstruction à l'hébergeur. Il faut pour cela que le site soit relié à un dépôt Git (voir
« Mise en ligne », méthode 2) :

1. Dans Netlify : *Site configuration > Build & deploy > Build hooks > Add build hook*, copier l'adresse obtenue.
2. Dans Supabase : *Edge Functions > Secrets*, ajouter `DEPLOY_HOOK_URL` avec cette adresse.
3. Dans Netlify, variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mêmes
   valeurs que `.env.example`), `NEXT_PUBLIC_SITE_URL` (adresse du site) et `NEXT_PUBLIC_SITE_INDEXABLE=false`.
4. Dans Supabase, *Authentication > URL Configuration* : ajouter `https://<adresse du site>/admin/**` aux *Redirect URLs*.

Tant que ce n'est pas fait, le bouton répond que la mise à jour automatique n'est pas encore branchée.

**Budget** : Netlify gratuit compte 15 crédits par mise en ligne sur 300 par mois. Le tableau de bord affiche le
compteur du mois (plafond réglable, 20 par défaut) ; regrouper ses changements avant de cliquer.
Supabase gratuit se met en pause après 7 jours sans activité : le site public n'est pas touché, l'administration
demande alors de relancer le projet depuis supabase.com.

## Fluidité

- **Écran d'accueil** : à la première ouverture du site dans un onglet, le logo et la devise s'affichent le temps que la page
  et les polices soient prêtes (0,6 s au minimum, 2 s au maximum). Les pages suivantes s'ouvrent directement.
  Code : `src/components/layout/splash.tsx`, styles `.splash` dans `src/app/globals.css`.
- **Barre de chargement** : un trait bleu en haut de l'écran pendant le passage d'une page à l'autre
  (`src/components/layout/navigation-progress.tsx`).
- **Transition** : chaque page apparaît en fondu (`src/app/[locale]/template.tsx`).

Mesures du 7 octobre 2026, téléphone simulé, premier passage sans cache : 340 à 410 Ko transférés par page.
En 3G (1,6 Mbit/s), le contenu principal s'affiche en 2 s environ ; en 3G lente (400 kbit/s), en 5 s environ.

## Mise en ligne sur Netlify

Le site est un dossier de fichiers (`out/`) : aucun serveur à administrer. Deux façons de le publier.

### 1. La plus simple : déposer le dossier

1. Copier `.env.example` sous le nom `.env.local` et y mettre l'adresse du site (celle que Netlify attribue, puis le nom de domaine).
2. `npm run build` : le site est construit dans `out/`.
3. Sur [app.netlify.com/drop](https://app.netlify.com/drop), glisser le dossier `out/`. Netlify donne une adresse en `.netlify.app`.
4. Si l'adresse obtenue diffère de celle du `.env.local` : la corriger, relancer `npm run build`, déposer de nouveau `out/`
   (dans Netlify : onglet Deploys du site). Sans cela, les aperçus de lien sur WhatsApp pointent vers la mauvaise adresse.

À chaque mise à jour du contenu : `npm run build`, puis déposer `out/` dans l'onglet Deploys.

### 2. La plus confortable : relier un dépôt Git

Pousser le projet sur GitHub, puis, dans Netlify, « Add new site » > « Import an existing project ». `netlify.toml` fournit
la commande (`npm run build`) et le dossier publié (`out`). Saisir `NEXT_PUBLIC_SITE_URL` dans les variables d'environnement
du site. Chaque envoi sur la branche principale publie alors le site.

### Réglages

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Adresse du site, sans barre finale. Sert aux aperçus de lien, au plan du site et aux données pour Google. |
| `NEXT_PUBLIC_SITE_INDEXABLE` | `true` le jour où le site doit apparaître dans Google. Sinon il reste hors des moteurs de recherche. |

`public/_redirects` envoie la racine vers `/fr/` ou `/en/` selon la langue du navigateur et sert la page « introuvable » du site.
`public/_headers` règle la mise en cache et quelques protections.

### Avant d'ouvrir le site au public

- Remplacer les textes entre crochets (coordonnées, frais, équipe, présentation) et ajouter les photos.
- Faire valider par la direction : les dates « À confirmer » du calendrier, la fiche d'inscription, la page Confidentialité
  (responsable de la publication, durée de conservation, règle sur les photos d'élèves). Cette page est un modèle rédigé
  de bonne foi : elle ne remplace pas l'avis d'un juriste au regard de la loi camerounaise sur les données personnelles.
- Tester un lien partagé sur WhatsApp : l'image, le titre et la description doivent apparaître.
- Passer `NEXT_PUBLIC_SITE_INDEXABLE` à `true`, reconstruire, publier, puis déclarer `…/sitemap.xml` dans Google Search Console.
- Supprimer les quatre articles `modele-…` de `content/news.ts`.
