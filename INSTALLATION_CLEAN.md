# AlaricCode — base propre « Écrin des Merveilles »

## Ce que contient l'archive

- `index.html` : choix du Groupe 1 ou du Groupe 2.
- `groupe1.html`, `groupe2.html` : vitrines avec Boutique, Promotions et Marchandises secrètes.
- `mj.html` : administration existante (stocks, objets, prix, affixes, imports, sauvegardes), plus configuration des rayons spéciaux.
- `boutique.css` : **une seule feuille de style joueur**.
- `mj-clean.css` : **une seule feuille de style MJ**.
- `js/app.js` : logique de recherche, panier, achats, Roll20 ; fonctionnalités des rayons ajoutées.
- `firestore.rules` : règles du panier existant + accès aux nouveaux documents de rayons.
- `data/` et `assets/` : catalogue et visuels conservés.

## Installation

1. **Sauvegarder** l'ancien site et les règles Firestore déjà publiées.
2. Vérifier dans `config.js` la configuration Firebase du projet existant.
3. Dans `firestore.rules`, remplacer `REMPLACE_PAR_TON_UID_MJ` par le véritable UID du MJ. Conserver toutes les restrictions d'écriture du stock et des prix.
4. Dans Firebase Authentication, vérifier que **la connexion anonyme est activée** pour les joueurs (nécessaire au panier et au rayon secret).
5. Comparer les règles de cette archive à celles de ton projet **avant publication** et déployer les règles adaptées dans Firebase Console → Firestore Database → Règles.
6. Publier les fichiers HTML/CSS/JS/assets/data sur ton hébergement habituel. Ne pas laisser les anciennes feuilles de style chargées dans un cache : recharge forte (`Ctrl + F5`).
7. Dans `mj.html`, se connecter au compte MJ, vérifier les livres de prix des deux groupes et tester un achat de petite quantité.
8. Dans **Configuration → Rayons spéciaux**, choisir un ou les deux groupes, sélectionner les articles dans Promotions / Marchandises secrètes, saisir ou changer le mot de passe secret (au moins 12 caractères), puis enregistrer.

Aucun `npm` ou déploiement de Cloud Functions n'est requis pour la boutique sur Firebase Spark.

## Promotions

La section **Promotions** n'invente pas de rabais. Elle affiche uniquement les objets que le MJ y place. Si le MJ veut un prix réduit, il le modifie dans le catalogue MJ et met à jour le livre des prix. Ces montants restent la source de vérité au checkout.

## Marchandises secrètes — précision de sécurité

Le rayon secret est **verrouillé dans l'interface** et son document Firestore ne peut être récupéré qu'en connaissant l'empreinte SHA-256 du mot de passe. Le mot de passe en clair n'est pas publié dans le HTML et peut être changé depuis l'espace MJ. Les documents secrets ne sont pas énumérables par les joueurs.

**Limite actuelle :** les fiches d'objets, les prix et une partie des métadonnées de catalogue sont déjà publics dans l'architecture Firebase d'origine. Ce rayon n'est donc **pas un coffre cryptographique pour des informations vraiment confidentielles** et les règles d'achat ne contrôlent pas le mot de passe au niveau serveur. Le mot de passe sert à débloquer la vitrine secrète du site. Ne pas y publier des informations MJ réellement secrètes tant qu'elles ne sont pas stockées dans une collection privée distincte.

## Préservation des achats

Les joueurs sélectionnent leurs objets, valident le panier puis confirment définitivement. Firestore vérifie et déduit les stocks si les règles et le livre de prix sont à jour. Le site affiche alors la commande `!co-alaric ...` à copier sur Discord. **Aucune commande Roll20 n'est exécutée par le site.**

## Vérifications et limites

- La présentation a été contrôlée hors réseau, avec des cartes fictives insérées dans la page pour vérifier les tailles d'écran.
- Les anciens tests automatisés du moteur d'achat, des prix et de Roll20 ont été exécutés localement.
- **Aucun achat réel ni publication de règles n'a été exécuté sur ton projet Firebase.** Teste la V9 sur un site de préproduction avant de remplacer l'ancienne boutique.
