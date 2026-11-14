# L’Échoppe d’Alaric — V4 Spark, sans Cloud Functions

**À lire impérativement avant installation : [`LIRE_AVANT_INSTALLATION_V4.md`](LIRE_AVANT_INSTALLATION_V4.md).**

Boutique JDR complète : les **cartes V4 validées**, les filtres déroulants, une grille adaptative **4 / 2 / 1**, l’espace MJ (stocks, objets personnalisés, import), les favoris, le panier et sa **double confirmation**, puis un **récapitulatif avec commande Roll20** pour transmission sur Discord.

Cette édition fonctionne sans Cloud Functions ni forfait Blaze : uniquement l’hébergement statique et **Firestore + Authentication sur Firebase Spark**, dans leurs quotas gratuits. La commande Roll20 n'est pas envoyée automatiquement à Discord.

## Fichiers essentiels

- `index.html`, `groupe1.html`, `groupe2.html` : vitrines et groupes distincts.
- `mj.html`, `mj.js` : espace MJ ; publication automatique des prix officiels des deux groupes.
- `js/app.js`, `js/checkout-free.js`, `shared.js`, `js/core.js`, `js/pricing.js` : boutique, règles de prix et transaction cliente.
- `data/`, `assets/`, `icons/` : catalogue complet, affixes, illustrations et références.
- `firestore.rules` : règles de sécurité à fusionner avec les règles MJ existantes **en conservant l'UID MJ réel**.
- `firebase.json` : déploiement des **règles Firestore uniquement**, sans fonctions.
- `LIRE_AVANT_INSTALLATION_V4.md` : instructions détaillées et limites de confiance.
- `tests/checkout-free.test.js` : tests du moteur transactionnel (`node --test tests/checkout-free.test.js`, facultatif).

Le site n’exige **aucun `npm install`** pour être utilisé. Les limites de sécurité d’une transaction validée dans un navigateur (sans serveur fiable) sont expliquées dans le guide d'installation.
