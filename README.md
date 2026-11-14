# AlaricCode V5 — Atelier MJ et boutique joueur

## Fonctionnement

- **groupe1.html** et **groupe2.html** : boutiques joueur V4, cartes compactes, recherche, filtres et panier à double confirmation.
- **Firebase Firestore** : synchronisation des stocks propres à chaque groupe, déduction après confirmation, livre de prix sécurisé par des règles Firestore.
- **Roll20** : le site génère une commande `!co-alaric panier ...` que le joueur **copie** puis envoie au MJ sur Discord ; aucune connexion et aucune exécution directe sur Roll20.
- **mj.html** : interface V5 pour gérer en parallèle les deux groupes, les stocks, les prix, les objets magiques, les imports JSON et les sauvegardes.

## Fonctionnalités V5 MJ

1. Tableau de bord sur **Groupe 1 et Groupe 2**, avec compteurs et suivi des prix.
2. Catalogue en tableau : stocks, prix (en PA), visibilité éditables **directement dans les cellules** ; enregistrement volontaire, pas à chaque frappe.
3. Sélection multiple pour appliquer une quantité commune, puis corriger les valeurs de chaque groupe ; afficher, masquer, retirer ou supprimer les créations MJ.
4. Atelier : sélection d'un modèle du catalogue, qualité Q0 à Q5 selon sa compatibilité, plusieurs affixes compatibles (consommable limité à un), prévisualisation et publication immédiate.
5. Import JSON du format V4 : sélection des objets, inspection détaillée, doublons traités **individuellement** par groupe (ignorer / remplacer). Pour un remplacement, le stock et le prix personnalisé sont conservés.
6. Export et restauration JSON intégrale du catalogue personnalisé, des stocks et des réglages des deux groupes. Aucun historique de commandes n'est inclus.

## Attention aux prix de l'atelier

Le catalogue V2 donne des **prix précis pour une base + un affixe**. Pour les combinaisons de plusieurs affixes ou une qualité supérieure à zéro, la V5 calcule une **estimation déterministe** à partir des liaisons du catalogue et du modèle P/Q fourni. Elle l'affiche explicitement comme une estimation ; aucune valeur officielle non présente dans les sources n'est inventée. L'édition manuelle des caractéristiques n'est pas proposée. Les créations non compatibles avec l'export Roll20 sont bloquées.

## Installation

Lire **INSTALLATION_V5.md**, puis **A_LIRE_EN_PREMIER.txt**.

Les guides de versions antérieures figurent dans `documentation/historique/` et ne doivent pas remplacer celui de la V5.
