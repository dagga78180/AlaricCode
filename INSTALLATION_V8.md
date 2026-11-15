# AlaricCode V8 — L'Écrin des Merveilles (nouvelle direction artistique)

## Nouveauté

La V8 reprend **intégralement la logique de la V7** et remplace uniquement l'habillage visuel du site :

- Illustration de la boutique physique dans l'en-tête, couleurs violet/améthyste/or et ornements discrets.
- Catalogue façon parchemin clair et cartes foncées à bordures dorées.
- Panier distinct, confirmation et affichage mobile assortis.
- Espace MJ aux mêmes couleurs, avec tableaux et formulaires lisibles.
- Quatre cartes par ligne sur les grands écrans, deux sur les tablettes et une sur mobile.
- Barre de recherche toujours visible, filtres repliables comme dans la V7.

L'image d'en-tête `assets/ecrin-merveilles-hero.webp` a été optimisée depuis l'illustration de la boutique physique fournie par le MJ.

**Aucune modification des prix, coefficients, descriptions RP, affixes, malus, stock, règles Firestore, commandes Roll20 ou JS de la V7.**

## Installation simple

1. Sauvegarde ton site V7, et idéalement exporte les deux boutiques depuis l'espace MJ.
2. Publie tous les fichiers du dossier `AlaricCode/` en remplacement de l'ancienne vitrine, **y compris** `v8-enchantee.css`, `v8-enchantee-mj.css` et `assets/ecrin-merveilles-hero.webp`.
3. Actualise les pages `groupe1.html`, `groupe2.html`, `index.html` et `mj.html` avec `Ctrl+F5` pour vider le cache CSS.
4. Vérifie l'affichage sur ordinateur et sur téléphone.
5. Effectue un achat de test sur un objet à stock limité dans chacun des deux groupes. Vérifie ensuite la copie de la commande Roll20.

**Ne réinitialise ni Firestore, ni les stocks, ni les prix.** Il n'y a aucun nouveau script d'installation à exécuter, et aucun changement nécessaire dans Firebase pour cette mise à jour purement visuelle.

Si la publication des prix MJ affichait déjà `Missing or insufficient permissions`, la V8 ne corrige pas ce problème préexistant de règles Firebase. Consulte `GUIDE_CORRECTION_FIREBASE.md` et assure-toi que ton UID MJ réel est autorisé dans les règles déployées.

## Périmètre conservé

- Boutique joueur, groupes 1 et 2, favoris, filtres, prix Normal/PA/PC.
- Validation en deux étapes et déduction du stock dans Firestore (Spark gratuit).
- Commande Roll20 seulement **copiée**, jamais exécutée depuis le site.
- Tableau MJ deux groupes, atelier qualité + multi-affixes, import JSON, doublons et sauvegardes.
- Référentiel de prix V7, issu de `COFantasy_Catalogue_Sain_Coefficients_Valides(2).xlsx`.

## Contrôles

Les 20 tests automatisés déjà présents dans V7 sont toujours verts. Vérifications CSS et captures simulées sur grand écran, tablette et mobile. Ces captures sont des exemples de rendu visuel, pas un test connecté à ton projet Firebase. Aucune opération Firestore réelle n'a été réalisée ici.
