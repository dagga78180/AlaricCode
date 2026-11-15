# AlaricCode V6 — Catalogue RP, nouveaux prix et MJ deux groupes

Version complète du site Alaric avec une boutique joueur, gestion de stock par groupe via Firestore, récapitulatif et **copie** d'une commande Roll20 pour transmission par Discord, et espace MJ.

## Points principaux

- **Catalogue du 15/11/2026** issu du fichier `documentation/source/COFantasy_Catalogue_Sain_RP_Prix_Valides.xlsx` : noms RP, effets courts, descriptions RP, prix actualisés, affixes et liaisons.
- **Boutique joueur** : cartes compactes par catégorie, description déroulante exclusivement RP, filtres, favoris, prix affichés en mode Normal, tout PA ou tout PC, panier double confirmation et déduction de stock.
- **Espace MJ (`mj.html`)** : deux groupes simultanés, tableau éditable stocks et prix, masquage/suppression, atelier depuis objets existants, qualité et plusieurs affixes, import JSON avec aperçu détaillé et doublons individuels, sauvegarde et restauration JSON.
- **Roll20** : le site produit `!co-alaric panier ...` à copier puis à envoyer au MJ ; il ne se connecte pas à Roll20 et n'y exécute rien.
- **Firebase Spark** : aucun serveur ni Cloud Function à déployer ; les opérations d'achat utilisent Firestore et ses règles de sécurité.

## Installation

Lire d'abord `A_LIRE_EN_PREMIER.txt`, puis **`INSTALLATION_V6.md`**. Sauvegarder le Firestore existant et synchroniser le livre des prix depuis `mj.html` après déploiement.

## Données et compatibilité

Les 63 références de la vitrine initiale restent en vente avec leurs stocks existants. Le reste du catalogue RP est disponible comme référence pour les créations MJ, pas publié automatiquement. Les prix personnalisés déjà stockés et les créations MJ existantes sont conservés : voir les règles de migration dans `INSTALLATION_V6.md`.

Les tarifs de qualité appliquent le barème Q du classeur ; le prix combiné de plusieurs affixes est une **estimation automatique**, et non une donnée officiellement présente dans le classeur.

**Tests :** syntaxe JS, tests automatiques du panier, contrôles du catalogue et tests navigateur avec Firebase simulé ; vérifier les règles et achats sur ton propre projet avant utilisation en séance.
