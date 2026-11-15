# AlaricCode V10.1 — Ajustements d'ergonomie et de lisibilité

Cette mise à jour part de la **V10 complète** et modifie l'apparence des pages joueur. Elle ne change ni les données du catalogue, ni les prix, ni les stocks Firebase, ni les scripts Roll20 ou MJ.

## Changements
- Suppression du bandeau « La Boutique d'Alaric » redondant des pages Groupe 1 et Groupe 2.
- Suppression du titre « Le catalogue » et de son compteur visibles ; identifiants conservés, invisibles et accessibles, pour le JavaScript.
- Barre compacte : recherche + mode d'affichage des prix + tri sur une seule ligne sur ordinateur ; réorganisation responsive sur mobile.
- Navigation Groupe 1 / Groupe 2 / Gestion MJ, Boutique / Promotions / Marchandises secrètes : nouveaux boutons fantasy violet/or avec états actifs lisibles.
- Police Georgia commune à toutes les parties du site joueur, y compris les boutons et champs.
- Marges et espacements internes des cartes augmentés pour éloigner les textes des bordures décoratives.
- Accueil des groupes simplifié, sans titre redondant.

## Installation
1. Conserver une copie du site en service et des règles Firestore avant le remplacement.
2. Remplacer les fichiers du site par ceux de cette archive.
3. Vider le cache du navigateur ou utiliser Ctrl + F5 pour recharger `boutique.css?v=v10-1`.
4. Vérifier les deux boutiques et les trois rayons, puis faire un essai de panier avec un objet de test.

Aucune opération npm ou Cloud Functions n'est nécessaire. Les règles de sécurité Firebase ne sont pas modifiées par cette mise à jour.

## Contrôles réalisés
- 29 tests Node.js réussis, dont ceux de la déduction du stock, des prix et de la commande Roll20.
- Vérification autonome du rendu HTML/CSS (cartes simulées) aux largeurs 1600, 1280, 800 et 420 pixels, sans débordement horizontal.
- La connexion Firebase réelle et le déploiement n'ont pas été testés.
