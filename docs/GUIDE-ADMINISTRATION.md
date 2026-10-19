# Administration du site : mode d'emploi

Pour le secrétariat et le Principal du Collège Tomi Fidele. L'administration s'ouvre à l'adresse du site suivie de
`/admin/` (par exemple `https://college-tomi-fidele.netlify.app/admin/`), sur ordinateur comme sur téléphone.

## Première connexion

1. L'administrateur du site vous envoie un message d'invitation.
2. Ouvrez `/admin/connexion/`, choisissez **Activer mon compte**, saisissez l'adresse email invitée et choisissez un mot
   de passe (8 caractères au moins).
3. Ouvrez le lien de confirmation reçu par email, puis connectez-vous.

Mot de passe oublié : sur l'écran de connexion, **Mot de passe oublié**.

## Qui fait quoi

| | Secrétariat | Principal | Administrateur du site |
| --- | --- | --- | --- |
| Actualités, calendrier, galerie, documents | rédige, propose | valide et publie | tout |
| Demandes des familles | traite | traite | traite |
| Mettre le site à jour | — | oui | oui |
| Réglages (coordonnées, frais, résultats, équipe, photos) | — | oui | oui |
| Numéros de paiement Mobile Money | — | consulte | modifie |
| Comptes, ménage du stockage | — | — | oui |

## Le parcours d'un contenu

1. **Secrétariat** : *Actualités* (ou Calendrier, Galerie, Documents) > **Nouvelle…**, remplir, **Envoyer au Principal**.
   Une modification d'un contenu déjà en ligne devient une *proposition* : la version en ligne reste jusqu'à la décision.
2. **Principal** : *À valider* (la pastille jaune indique le nombre), relire, **Valider et publier** ou **Renvoyer en brouillon**.
   Pour une proposition, le tableau compare l'ancienne et la nouvelle version.
3. **Principal** : quand plusieurs changements sont validés, *Tableau de bord* > **Mettre le site à jour**. Le site
   change en une à deux minutes.

Regroupez vos changements avant de cliquer : l'hébergement gratuit permet une vingtaine de mises à jour par mois
(le compteur est sur le tableau de bord).

## Les demandes des familles

Les préinscriptions et les messages envoyés depuis le site arrivent dans **Demandes des familles** (pastille jaune =
demandes nouvelles). Chaque préinscription a un numéro de suivi (`P26-0001`) que la famille a reçu à l'écran.

1. Ouvrez la demande (cliquer sur la ligne).
2. **Appeler** ou **Répondre sur WhatsApp** : le message de réponse est déjà commencé, dans la langue de la famille.
3. Indiquez la **suite donnée** : *Famille contactée*, puis *Inscription confirmée* ou *Sans suite* (pour un message : *Traité*).
4. Notez ce qui a été convenu dans la **note interne** (jamais visible par la famille), puis **Enregistrer la note**.

**Exporter pour Excel** télécharge la liste affichée (filtres et recherche compris). Les demandes sont effacées
automatiquement 12 mois après leur envoi, comme annoncé aux familles.

## Les réglages du collège (Principal)

*Réglages* regroupe ce qui change rarement : coordonnées et horaires, année scolaire et concours, frais de scolarité,
résultats aux examens, équipe de direction, photos des pages. Après **Enregistrer**, le changement apparaît sur le site
à la prochaine **mise à jour du site**.

Règle du site : jamais de chiffre inventé. Une case laissée vide affiche « à fournir ».

## En cas de souci

- *« Supabase est en pause »* : après 7 jours sans activité, l'administration s'endort ; l'administrateur du site la
  relance depuis supabase.com. Le site public, lui, reste en ligne.
- *La mise à jour du site n'a pas abouti* : le tableau de bord affiche la raison ; prévenir l'administrateur du site.
- *Une personne quitte le collège* : l'administrateur suspend son accès dans *Comptes*.
