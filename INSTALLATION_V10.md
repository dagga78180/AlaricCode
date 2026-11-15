# AlaricCode V10 — L'Écrin des Merveilles

Cette version est une **refonte visuelle de la V9 propre**. Les stocks, prix, catalogue, règles Firestore, panier, double confirmation, deux groupes, promotions, rayons secrets et commandes Roll20 sont conservés.

## Installation sans perte de stock

1. Sauvegarde le dossier actuel du site et tes règles Firestore.
2. Remplace les fichiers du site déployé par ceux de cette archive, en conservant la configuration Firebase propre à ton projet (`config.js` et `.firebaserc` si nécessaire). Ne déploie jamais un identifiant Firebase qui ne correspond pas à ton projet.
3. Recharge la boutique avec `Ctrl + F5`, ou vide le cache du navigateur si les images sont anciennes.
4. Vérifie l'accès au Groupe 1, au Groupe 2, l'affichage des cartes, les filtres et le panier.
5. Si tu souhaites vérifier les achats, effectue d'abord un achat de test sur un article de faible stock et contrôle la commande Roll20 générée. Ne réalise pas d'achat réel tant que les permissions Firebase ne sont pas vérifiées.

Le moteur Firestore et les scripts de facturation ne sont pas remplacés par cette mise à jour. Aucun Cloud Functions / npm n'est requis pour ces changements visuels.

## Architecture visuelle

- `boutique.css` : **unique feuille de style joueur**, sans cascade des anciens thèmes V8.
- `mj-clean.css` : **unique feuille de style MJ**.
- `assets/header-palais.webp` : décor de la boutique dans l'en-tête.
- `assets/sol-arcane.webp` : décor au pied de page.
- `assets/parchemin-texture.webp` : texture légère de la surface centrale et des filtres.
- `assets/ornate-card-frame.svg` : encadrement des cartes via le CSS.
- `assets/ornate-cart-crest.svg` : emblème du coffre-panier via le CSS.

Les images sont des décors ; les textes, cartes, statistiques, prix et boutons restent de vrais éléments HTML, dynamiques et accessibles.

## Limites et précautions

Les captures d'aperçu sont réalisées sur le vrai HTML/CSS dans Chromium **avec des exemples d'objets injectés hors réseau**. Elles ne prouvent pas un fonctionnement sur ton Firebase réel. Les 23 tests du projet et les tests du thème passent localement.

Le mot de passe des marchandises secrètes côté client ne garantit pas à lui seul la confidentialité de toutes les données Firestore. Il faut des règles et une architecture adaptées pour des objets qui doivent être réellement invisibles aux joueurs non autorisés. Les règles existantes n'ont pas été assouplies.

Les données Roll20 sont copiées pour transmission au MJ ; aucune commande n'est exécutée automatiquement.
