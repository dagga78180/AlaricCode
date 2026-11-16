# AlaricCode V10.4 — L'Écrin des Merveilles

Boutique fantasy Chroniques Oubliées, pour un même marchand Alaric avec deux groupes d'aventuriers et **deux stocks distincts**. Catalogue commun, prix officiels, Promotions, marchandises secrètes, panier à double confirmation et commande Roll20 à copier manuellement.

## Fichiers importants

- `index.html` : accès aux deux groupes.
- `groupe1.html` / `groupe2.html` : vitrines joueur (style V10.2 conservé).
- `mj.html` : les **quatre onglets MJ** : Vue d’ensemble, Gestion des rayons, Création d’objets, Export.
- `js/rayons-mj.js` : glisser-déposer carte complète/G1/G2, stocks éditables, réductions, mot de passe, sauvegarde transactionnelle.
- `mj-v5.js` : tableau avancé, fabrication d'objets, import/export et réparation des tarifs existants.
- `boutique.css` et `mj-clean.css` : une feuille CSS par interface.
- `data/` : catalogue de référence et barèmes officiels.
- `firestore.rules` : règles à publier **séparément de GitHub Pages** avec l'UID MJ correct.

**Lis `INSTALLATION_V10_4.md` AVANT de remplacer les fichiers** : la V10.4 requiert les autorisations prévues par la V10.3 en ligne. Le ZIP ne modifie pas ton Firebase automatiquement.

Firebase Spark sans Cloud Functions. Aucune commande Roll20 n'est exécutée automatiquement.
