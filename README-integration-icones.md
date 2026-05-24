# Intégration des icônes JDR

Structure ajoutée :

```text
assets/icons/
├── manifest.json
├── manifest.csv
├── palette.csv
├── rarities.css
├── preview_sheet.png
├── png_512/
└── svg/
```

## Fonctionnement

`app.js` charge maintenant `assets/icons/manifest.json` avant `catalogue.json`.

Pour chaque objet du catalogue, l’app essaie de trouver automatiquement une icône selon :

1. `iconKey` ou `iconName` si le champ existe dans `catalogue.json` ;
2. le champ `icon` si ce n’est pas déjà une image ;
3. le nom de l’objet ;
4. la sous-catégorie ;
5. la catégorie.

La rareté de l’objet est utilisée pour choisir la variante de couleur correspondante.

## Forcer une icône précise

Dans `catalogue.json`, tu peux ajouter :

```json
{
  "name": "Épée longue +1",
  "rarity": "Rare",
  "iconKey": "Epee_longue"
}
```

Tu peux aussi garder un chemin direct :

```json
{
  "name": "Épée longue +1",
  "rarity": "Rare",
  "icon": "assets/icons/png_512/Epee_longue/Epee_longue_R03_rare.png"
}
```

## Icônes disponibles

- `Arbalette`
- `Arc`
- `Baton`
- `belt`
- `boots`
- `broadhead-arrow`
- `Chemise_de_maille`
- `cloak`
- `Cuir`
- `Dague`
- `emerald-necklace`
- `Epee`
- `Epee___2_main`
- `Epee_Batarde`
- `Epee_longue`
- `fire-bottle`
- `gloves`
- `Grand_Bouclier`
- `Hache`
- `Hache___2_main`
- `heavy-bullets`
- `Javelot`
- `Lance`
- `Marteau`
- `Masse`
- `Masse___2_main`
- `Mousquet`
- `Petit_Bouclier`
- `Petoire`
- `plaque`
- `potion-ball`
- `potion-of-madness`
- `Rapiere`
- `ring`
- `round-potion`
- `scroll-unfurled`
- `swap-bag`
- `Tissu`
