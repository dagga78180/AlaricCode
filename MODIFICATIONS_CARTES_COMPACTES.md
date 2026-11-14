# Cartes compactes — mise à jour 14 novembre 2026

Cette version reprend le site fourni, sans modification des données JSON, des collections Firestore, de l'éditeur MJ, des règles de stock ni des commandes Roll20.

## Carte joueur

- Format compact : icône 58 px, informations alignées, moins de badges et de hauteur, grille adaptative.
- Armes : nom suivi de +Q, bonus d'attaque (+Q), DM déduits des données V2 (`NdX[+Q][+caractéristique]`), effet de l'affixe ou particularité de l'arme, description déroulante.
- Armures et boucliers : nom suivi de +Q, protection de base + Q, malus issu du catalogue, effet, description déroulante.
- Accessoires : emplacement du modèle V2, effet, description déroulante.
- Munitions : effet, description déroulante.
- Matériel : libellé affiché « Matériel » au lieu de « Divers » ; description déroulante seule. La clé interne `divers` est conservée pour la compatibilité.
- Consommables : effet et description **tous deux sous « Voir effet et description »**, et non visibles avant ouverture.
- Description complète en expansion ; effets d'affixes exacts repris du catalogue V2 lorsque disponibles.
- Le prix, le stock, le bouton Ajouter, les favoris et la rareté restent visibles.
- Les descriptions déjà ouvertes restent ouvertes après mise à jour du panier et des favoris.

## Fichiers modifiés

- `shared.js` : met à disposition les propriétés techniques V2, sans modifier la gestion des données.
- `js/app.js` : affiche chaque carte suivant sa famille ; récupération des statistiques à partir du modèle de base, y compris pour les créations MJ.
- `styles.css` : nouvelle présentation compacte et responsive, sans toucher au style de l'interface MJ.
- `index.html`, `groupe1.html`, `groupe2.html` : actualisation des versions des ressources dans les URLs pour vider les anciens caches du navigateur.

## Validation

Syntaxe JavaScript vérifiée avec Node.js et contrôle des 6 familles de cartes avec des exemples du catalogue V2, incluant qualités Q1/Q2, DM, DEF, emplacement, effets d'affixes et descriptions.

La connexion à la base Firestore réelle, le rendu sur ton hébergement et l'import Roll20 n'ont pas été exercés dans cet environnement de test : ces éléments n'ont pas été modifiés.
