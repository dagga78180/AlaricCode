# AlaricCode V8.1 — Style « Grimoire enchanté × Atelier alchimique »

Cette mise à jour réinterprète plus fidèlement la maquette violette, or et parchemin approuvée.
**Il s'agit d'une mise à jour graphique uniquement** : le catalogue V7, les prix, les groupes,
les commandes Roll20, les achats Firestore et les règles d'accès ne sont pas changés.

## Installation

1. Sauvegarder la version existante du site.
2. Copier les fichiers complets de cette archive dans l'hébergement existant (ou remplacer
   les fichiers HTML, CSS et les nouveaux assets après une sauvegarde).
3. Mettre à jour le site hébergé, puis forcer le rechargement du navigateur (`Ctrl + F5`).
4. Vérifier les deux boutiques, l'ouverture des filtres, le panier et l'accès MJ.

**Aucun déploiement de règles Firestore, aucune installation npm et aucune fonction Cloud
ne sont nécessaires pour ce changement d'apparence.**

## Modifications visuelles

- Bandeau Alaric plus illustré, texte doré et menus façon enseigne.
- Titre de boutique sur une plaque de parchemin.
- Panneau parchemin à gauche conservant **les filtres repliables** validés précédemment.
- Fond de catalogue violet sombre, cartes velours encadrées d'or, boutons lumineux.
- Panneau panier plus contrasté, rappelant un coffret d'objets magiques.
- Cercle runique décoratif en bas de page.
- Ajustements de l'espace MJ pour conserver une identité visuelle cohérente.
- Mise en page responsive (4 colonnes sur grand écran, 2 sur tablette, 1 sur mobile).

## Notes importantes

Les images de concept générées précédemment sont des **illustrations de direction artistique**.
Le site doit conserver de vrais textes, boutons, filtres et un catalogue dynamique. Il ne
s'agit donc pas d'un découpage de la maquette en image fixe. Les ornements supplémentaires
restent de la présentation CSS/SVG, sans interactions inutiles.

Le bouton de filtre est désormais situé dans le panneau latéral, mais ouvre toujours les
mêmes champs. Sur téléphone, le panneau se replie en une petite barre avant le catalogue.

Si un problème de permissions Firestore existait déjà, cette mise à jour graphique ne peut
pas le corriger : vérifier les règles et l'UID MJ séparément.

## Fichiers concernés

- `index.html`, `groupe1.html`, `groupe2.html`, `mj.html`
- `v8-1-prestige.css`, `v8-1-prestige-mj.css`
- `assets/arcane-floor.svg`

Les scripts JavaScript, catalogues et règles Firestore sont byte pour byte identiques à V8.
