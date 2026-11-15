# AlaricCode V8.3 — Correction de fidélité graphique

Cette version est une reprise graphique de la V8.2, selon l'illustration validée.

## Nouveautés visuelles
- Le fond de boutique est présent derrière l'ensemble de l'interface.
- Le grand panneau central en parchemin regroupe les filtres et le catalogue.
- Les cartes reprennent un écrin violet avec bordure dorée et pied ivoire.
- Le panier possède une bordure et une couronne façon coffret enchanté.
- Le sol runique apparaît sous la boutique.
- 4 cartes à partir de 1280 px, 2 sur tablette, 1 sur téléphone (3 dans certaines tailles intermédiaires).

## Installation
1. Sauvegarder le site actuel avant remplacement.
2. Décompresser l'archive, puis publier les fichiers du dossier `AlaricCode/` à la place du site actuel.
3. Bien transférer `v8-3-reference-fidele.css` et les trois nouvelles images sous `assets/` : `ornate-card-frame.svg`, `ornate-cart-crest.svg`, `enchanted-floor.webp`.
4. Actualiser le navigateur avec Ctrl + F5 (sur mobile, vider le cache du site si nécessaire).
5. Vérifier `groupe1.html`, `groupe2.html` et `mj.html`.

Aucune installation npm, Cloud Functions ou modification des règles Firebase n'est requise pour ces seuls changements visuels.

## Ce qui n'a pas été modifié
Le moteur du panier, le catalogue JSON fourni avec la V8.2, les scripts métier, les stocks, les tarifs, les commandes Roll20 et les règles Firestore sont inchangés.

## Tests et limites
- Tests automatiques Node : 20/20 réussis.
- Rendu desktop/mobile contrôlé avec une simulation HTML en Chromium, sans données Firebase de production.
- La connexion et les autorisations Firebase réelles restent à vérifier après mise en ligne.
