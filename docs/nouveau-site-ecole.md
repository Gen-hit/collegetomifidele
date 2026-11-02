# Ouvrir le site d'un nouvel établissement

Ce dépôt est le **modèle « EduFlow Site »** : le même code sert à plusieurs écoles. Rien dans
`src/` ni dans `messages/` ne contient le nom d'une école ; tout ce qui change tient dans quelques
fichiers.

## 1. Les six choses à changer

| Quoi | Où | Remarque |
|---|---|---|
| Nom, sigle, devise, logo, adresse du site, point sur la carte | `content/data/school.json` | Le **seul** fichier d'identité. |
| Logo | `public/brand/<fichier>.png` | Chemin indiqué dans `school.json` (`logo.src`). |
| Images de partage | `public/og/<préfixe>-fr.jpg` et `-en.jpg` | Préfixe indiqué dans `school.json` (`ogImagePrefix`), 1200 × 630. |
| Couleurs | `src/app/globals.css` | Les tokens en haut du fichier. Facultatif : le thème par défaut convient. |
| Niveaux et classes proposés | `content/levels.ts` | Retirer les lignes que l'école ne propose pas. |
| Examens suivis | `content/results.ts` (`exams`) | Idem. |

Dans `school.json`, `slug` est l'identifiant de l'école dans la base du back-office. Les variables
d'environnement `NEXT_PUBLIC_SCHOOL_SLUG`, `NEXT_PUBLIC_SITE_URL` et `SCHOOL_SLUG` (construction)
le remplacent si elles sont définies chez l'hébergeur.

## 2. Le nom de l'école dans les textes

Les fichiers `messages/fr/*.json` et `messages/en/*.json` écrivent `{{school}}` là où le nom de
l'établissement doit apparaître. Il est remplacé à la construction par `name` de `school.json`
(`src/i18n/dictionaries.ts`). **Ne jamais écrire un nom d'école en dur dans `messages/`.**

Les autres emplacements entre crochets — « [Nom du Principal] », « [Club 1 : nom à fournir] » —
sont les textes que l'école remplit elle-même dans l'administration (Réglages → Textes du site).
Tant qu'ils ne sont pas remplis, le passage ne s'affiche pas sur le site.

## 3. Le back-office

1. Dans la base Supabase, ajouter la ligne de l'école dans `schools` (`slug`, `name`), puis créer
   les comptes du personnel (`profiles`) avec leur rôle.
2. Chez l'hébergeur (Netlify), définir `NEXT_PUBLIC_SCHOOL_SLUG`, `SCHOOL_SLUG`,
   `NEXT_PUBLIC_SITE_URL` et les clés Supabase.
3. À la première construction, `scripts/pull-content.mjs` lit la base et écrit `content/data/*.json`.
   Sans base reliée, le site utilise les fichiers du dépôt, ce qui permet de travailler hors ligne.

## 4. La liaison avec EduFlow

Voir `docs/pont-eduflow.md`. Une fois le site en place : Réglages → « Liaison avec EduFlow » →
créer la clé, puis la coller dans EduFlow (Paramètres → Site web). EduFlow remonte alors les
préinscriptions et propose le calendrier, les frais, les résultats et l'équipe de direction.

## 5. Vérifier avant de livrer

```bash
npm run typecheck
npm run build
grep -rn "{{school}}" out --include="*.html"   # doit ne rien renvoyer
```

La dernière commande confirme que le nom de l'école a bien remplacé le jeton partout.
