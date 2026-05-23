# Boutique d'Alaric

Mini-site statique pour une boutique de JDR utilisable avec GitHub Pages, Netlify ou en local.

## Fichiers

- `index.html` : structure de la page
- `styles.css` : thème visuel violet/rose enchanté, affichage en liste
- `app.js` : catalogue, filtres, recherche, panier et copie de commande
- `catalogue.json` : copie du catalogue en données JSON, utile si tu veux modifier/importer les objets plus tard
- `.nojekyll` : évite certains traitements GitHub Pages

## Mise en ligne avec GitHub Pages

1. Crée un dépôt GitHub public.
2. Ajoute tous les fichiers à la racine du dépôt.
3. Va dans `Settings > Pages`.
4. Source : `Deploy from a branch`.
5. Branche : `main`.
6. Dossier : `/root`.

L'adresse ressemblera à :

```text
https://ton-pseudo.github.io/boutique-alaric/
```

## Modifier les objets

La version actuelle lit les objets depuis `app.js`, dans le tableau `ITEMS` au début du fichier.

Chaque objet ressemble à ça :

```js
{
  id: "potion-soins",
  category: "Potions",
  subcategory: "Potions",
  name: "Potion de soins",
  rarity: "Commun",
  description: "Rend 1d8 + Niveau Point de vie",
  price: 50,
  icon: "https://..."
}
```

## Panier

Le panier est stocké dans le navigateur du joueur avec `localStorage`. Il n'y a donc pas de serveur, pas de compte, et pas de paiement réel.

Le bouton `Copier la commande` génère un texte prêt à coller dans Roll20 ou Discord.
