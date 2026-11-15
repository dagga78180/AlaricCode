# AlaricCode V10.2 — Finition de la boutique

La base est la V10.1, sans nouvelle feuille de style et sans modification des prix, données, Cloud Functions ou règles Firebase.

## Changements
- **Ordre stable des catégories :** Arme, Armure, Accessoire, Consommable, Munition, Matériel. Tous les tris (dont Sélection d’Alaric d’abord) fonctionnent **à l’intérieur de chaque catégorie**, sans mélanger les rayons.
- **Police plus claire :** Segoe UI, avec Tahoma et Arial en solutions de repli, appliquée aussi aux boutons et aux champs ; chiffres tabulaires pour stocks, prix et dégâts.
- **Stock simplifié :** `S = 1` à la place de « Stock : 1 · Dernier », même présentation `S = n` pour toutes les quantités.
- **Carte objet :** bouton Ajouter plus grand et stock légèrement remonté, avec davantage d’espace dans le pied parchemin.
- **Panier :** première ligne « Nom · Qté n · − · + · × », deuxième ligne « Prix : montant total de la ligne ». Le prix respecte le mode normal, tout PA ou tout PC sélectionné dans la boutique.

## Installation
1. Sauvegarder le site actuel et les règles Firestore.
2. Remplacer les fichiers du site par ceux du ZIP V10.2.
3. Actualiser avec `Ctrl + F5` ; les pages chargent `boutique.css?v=v10-2` et `js/app.js?v=v10-2`.
4. Tester le catalogue des deux groupes et un panier avec quantités 1 et 2.

Les stocks Firestore, le moteur de paiement, la double confirmation, l'espace MJ et les commandes Roll20 ne sont pas modifiés. Aucun déploiement de règles Firestore nécessaire pour cette mise à jour purement interface.
