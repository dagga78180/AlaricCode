# Boutique d’Alaric

Mini-site statique prêt pour GitHub Pages.

Fonctions incluses :

- catalogue de 73 objets ;
- catégories : armes, armures, accessoires, potions, objets ;
- recherche ;
- filtre par catégorie et rareté ;
- panier avec quantités ;
- total automatique ;
- bouton **Copier la commande** pour Roll20 ou Discord ;
- sauvegarde du panier dans le navigateur du joueur avec `localStorage`.

## Fichiers

```text
index.html      Page principale
styles.css      Style visuel fantasy
app.js          Catalogue + logique du panier
.nojekyll       Désactive le traitement Jekyll sur GitHub Pages
README.md       Cette notice
```

## Tester en local

Ouvre simplement `index.html` dans ton navigateur.

## Mettre en ligne avec GitHub Pages

1. Crée un nouveau dépôt GitHub, par exemple `boutique-alaric`.
2. Envoie tous les fichiers du dossier à la racine du dépôt.
3. Va dans **Settings** → **Pages**.
4. Dans **Build and deployment**, choisis :
   - Source : `Deploy from a branch`
   - Branch : `main`
   - Folder : `/root`
5. Clique sur **Save**.
6. Le site sera disponible à une adresse du type :

```text
https://TON-PSEUDO.github.io/boutique-alaric/
```

## Modifier les objets

Ouvre `app.js`, puis modifie le tableau `ITEMS` au début du fichier.

Exemple :

```js
{
  id: "potion-soins",
  category: "Potions",
  subcategory: "Potions",
  name: "Potion de soins",
  rarity: "Commun",
  description: "Rend 1d8 + Niveau points de vie.",
  price: 50,
  icon: "https://..."
}
```

Conseils :

- `id` doit être unique.
- `price` doit rester un nombre, sans `po`.
- `icon` peut être vide si tu n’as pas d’image.

## Utilisation en partie

Les joueurs ajoutent les objets au panier, cliquent sur **Copier la commande**, puis collent le texte dans Roll20 ou Discord.

Exemple :

```text
Commande chez Alaric :
- Potion de soins x2 = 100 po
- Corde x1 = 4 po

Total : 104 po
```
