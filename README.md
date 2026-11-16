# AlaricCode — Version 10.3

Site de boutique fantasy pour Chroniques Oubliées, avec deux groupes, catalogue, promotions, rayon secret, gestion MJ, panier à double confirmation et commande Roll20 à copier manuellement sur Discord.

- `index.html` : choix des groupes.
- `groupe1.html`, `groupe2.html` : boutiques joueur, promotions et rayon secret.
- `mj.html` : administration MJ et réparation des tarifs.
- `boutique.css`, `mj-clean.css` : **une feuille de style par interface** ; aucune ancienne cascade CSS.
- `data/` : référentiel des prix et du catalogue.
- `firestore.rules` : règles à **personnaliser avec ton UID MJ avant publication**.
- `INSTALLATION_V10_3.md` : étapes complètes de migration, précautions et tests.

Le site n'exécute aucune commande Roll20. Firebase gère les stocks et la tarification qui sécurise les achats. Pas de Cloud Functions.
