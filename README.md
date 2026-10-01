# L'échoppe Fantastique d'Alaric

Mini-site statique pour une boutique de JDR utilisable avec GitHub Pages, Netlify ou en local.

Cette version utilise les trois visuels générés :

- `assets/background-tile.png` : fond violet/doré répétable, préparé pour se raccorder dans toutes les directions
- `assets/header-alaric.png` : bannière header avec le titre décoré
- `assets/footer-filigree.png` : clôture de footer en filigrane doré

## Fichiers

- `index.html` : structure de la page
- `styles.css` : thème visuel violet/doré, fond magique, header et footer imagés
- `app.js` : catalogue, filtres, recherche, panier et copie de commande
- `catalogue.json` : copie du catalogue en données JSON, utile si tu veux modifier/importer les objets plus tard
- `.nojekyll` : évite certains traitements GitHub Pages
- `assets/` : images du thème

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


## Passerelle Roll20 / COAlaric 1.0 + CoFItem CLEAN 5.06.0

Le panier génère désormais une commande Roll20 unique :

```text
!co-alaric panier --target @{target|PJ|character_id} --data ...
```

1. Installe `COFantasy-V1_CLEAN_5.06.0.js`, `CoFItem-V1_CLEAN_5.06.0.js` et `COAlaric-V1.0.js` dans l’API Roll20.
2. Compose le panier sur le site.
3. Clique **Copier pour Roll20**.
4. Colle la commande dans le chat Roll20 en tant que MJ.
5. Roll20 demande de cibler le PJ ; COAlaric ouvre la transaction (achat, marchandage ou vol) et CoFItem revalide les objets avant tout transfert.

Le site ne contient aucune logique mécanique de combat ni d'affinité. Les IDs `Bxxx` et `Axxx` sont validés côté CoFItem. COAlaric orchestre le marchandage, le vol, l'ardoise et le paiement dans Roll20 ; une commande modifiée manuellement ne peut pas contourner la validation de compatibilité du catalogue.

La **Dague de parade** historique est conservée à l’écran mais désactivée : `A002` n’est plus compatible avec `B003` dans le catalogue CoFItem actuel.
