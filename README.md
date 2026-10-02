# AlaricCode V5.1

## V5.1 — cartes et stock complet

- Le catalogue public est affiché en cartes compactes et responsives.
- Le stock est visible directement sur chaque carte, y compris `∞` pour un stock illimité.
- Supabase peut limiter aussi bien les objets de la Sélection d’Alaric que les objets du catalogue de base.
- `stock.html` charge les deux catalogues et permet de filtrer : Tous / Sélection d’Alaric / Catalogue de base.
- Les boutons globaux de `stock.html` s’appliquent au catalogue sélectionné dans le filtre.


Boutique statique pour GitHub Pages, avec catalogue JSON local et **stocks partagés via Supabase**.

## Architecture

- `catalogue.json` : sélection d’Alaric et données permanentes des objets.
- `catalogue-item-de-base.json` : catalogue de base.
- `assets/icons/` : bibliothèque complète d’icônes et variantes de rareté.
- `supabase-config.js` : URL + publishable key Supabase utilisées par le navigateur.
- `supabase-setup.sql` : script à exécuter une fois dans Supabase.
- `stock.html` : interface MJ de gestion des quantités.

Les JSON ne servent plus à stocker les quantités courantes. Une ligne absente de la table Supabase `stocks` signifie **stock illimité**.

## Convention de stock

- aucune ligne Supabase : illimité (`∞`)
- `stock = 0` : épuisé
- `stock = 1` : dernier exemplaire
- `stock >= 2` : quantité disponible

Les objets de `catalogue.json` (Sélection d’Alaric) **et** de `catalogue-item-de-base.json` peuvent tous recevoir un stock Supabase. Une ligne absente reste synonyme de stock illimité.

## Mise en place Supabase

1. Ouvrir le projet Supabase.
2. Aller dans **SQL Editor**.
3. Copier/coller puis exécuter le contenu de `supabase-setup.sql`.
4. Dans **Authentication > Users**, créer le compte MJ avec email + mot de passe.
5. Garder les inscriptions publiques désactivées : seul le compte MJ doit pouvoir se connecter.
6. Déployer le dossier sur GitHub Pages.

La publishable key présente dans `supabase-config.js` est une clé publique prévue pour une application navigateur. Ne jamais mettre une `service_role` ou une secret key dans GitHub Pages.

## Utilisation

### Joueurs

Ils ouvrent `index.html`. Le site charge les catalogues puis récupère les stocks Supabase. Les stocks sont relus automatiquement toutes les 30 secondes.

### MJ

Ouvrir :

```text
https://<ton-site-github-pages>/stock.html
```

Se connecter avec le compte créé dans Supabase. Les commandes disponibles sont :

- `−` : retire une unité
- `+` : ajoute une unité
- `0` : met immédiatement en rupture
- `∞` : supprime la limite de stock
- champ numérique : saisie directe
- `Tout mettre à 1`
- `Tout mettre en illimité`

Chaque modification est enregistrée immédiatement dans Supabase. Aucun export JSON et aucun commit GitHub ne sont nécessaires pour les changements de stock.

## Comportement en cas de panne Supabase

La boutique continue de charger les catalogues. Un avertissement est affiché et les éventuelles valeurs `stock` encore présentes dans `catalogue.json` servent de secours. Si aucune valeur locale n’existe, l’objet est considéré comme illimité.
