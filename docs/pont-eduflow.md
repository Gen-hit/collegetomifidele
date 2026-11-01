# Pont EduFlow ↔ site

EduFlow est le logiciel de gestion installé au collège. Il échange avec le site par la fonction serveur
`eduflow-sync`, identifié par une **clé de liaison** (jamais la clé secrète Supabase).

## Ce qui circule

| Sens | Quoi | Effet sur le site |
|---|---|---|
| Site → EduFlow | Préinscriptions reçues (relevées toutes les 15 min) | Aucun |
| EduFlow → site | Suite donnée (contactée, acceptée, refusée, dossier créé) | Statut de la préinscription mis à jour |
| EduFlow → site | Dates à venir du calendrier | Proposition dans « À valider » |
| EduFlow → site | Grille des frais (tranches, échéances, inscription) | Proposition dans « À valider » |

Rien n'est mis en ligne sans le Principal : une ligne déjà publiée reçoit une proposition (`pending`),
une nouvelle ligne arrive avec le statut `submitted`.

## Mise en service (une fois)

1. Appliquer la migration `20261101000800_pont_eduflow.sql` (`supabase db push`).
2. Déployer la fonction : `supabase functions deploy eduflow-sync --no-verify-jwt`
   (EduFlow n'a pas de compte : c'est la clé de liaison qui l'identifie, vérifiée par la fonction).
3. Administration du site → Réglages → « Liaison avec EduFlow » → Créer la clé de liaison.
4. EduFlow → Paramètres → Site web : adresse `https://<projet>.supabase.co` + la clé. EduFlow vérifie la liaison.

Créer une nouvelle clé invalide l'ancienne ; « Couper la liaison » bloque EduFlow immédiatement.
La base ne garde que l'empreinte SHA-256 de la clé.
