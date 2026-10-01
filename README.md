# L’échoppe Fantastique d’Alaric

Mini-site statique pour une boutique de JDR, utilisable avec GitHub Pages, Netlify ou un petit serveur local. Le site reste en HTML/CSS/JavaScript pur et ne nécessite ni compte, ni base de données.

## Fichiers principaux

- `index.html` : boutique destinée aux joueurs.
- `styles.css` : thème violet/doré et mise en page.
- `app.js` : chargement des catalogues, filtres, favoris, stock, panier et commande Roll20.
- `catalogue.json` : **sélection d’Alaric pour la rencontre**. C’est ce fichier qui peut gérer un stock.
- `catalogue-item-de-base.json` : catalogue de référence. Aucun stock n’est imposé dessus.
- `stock.html` / `stock.js` : outil MJ pour modifier uniquement les stocks de `catalogue.json` et réexporter le fichier.
- `assets/` : visuels et icônes nécessaires au site.

## Les deux catalogues

Le site charge indépendamment les deux fichiers JSON :

1. `catalogue.json` → **Sélection d’Alaric** ;
2. `catalogue-item-de-base.json` → **Catalogue de base**.

Si un des deux fichiers est absent ou invalide, l’autre reste utilisable et un avertissement est affiché.

Les IDs doivent être uniques et stables. Ils servent au panier et aux favoris.

## Gestion du stock

Le stock ne concerne que les objets de `catalogue.json`.

Un objet peut contenir :

```json
{
  "id": "lance-gardienne-alaric",
  "name": "Lance gardienne",
  "price": 180,
  "stock": 2
}
```

Règles :

- `"stock": 0` → objet épuisé ;
- `"stock": 1` → dernier exemplaire ;
- `"stock": 2` ou plus → quantité disponible ;
- champ `stock` absent → stock non limité, comportement identique aux anciennes versions du site.

Le panier ne peut pas dépasser un stock fini. Si un joueur possède un ancien panier et que le nouveau catalogue contient moins d’exemplaires, le panier local est automatiquement ajusté.

### Outil MJ

Ouvre `stock.html` depuis le site publié. La page charge automatiquement `catalogue.json`.

Elle permet de :

- modifier rapidement chaque quantité avec `−`, `+`, `0` ou une saisie directe ;
- laisser le champ vide pour un stock non limité ;
- mettre tous les objets à `1` ;
- remettre tous les objets en stock non limité ;
- annuler les modifications ;
- importer manuellement un autre fichier JSON ;
- exporter un nouveau `catalogue.json`.

L’outil ne modifie jamais automatiquement le fichier hébergé : après export, remplace simplement `catalogue.json` dans le dépôt par le fichier généré.

Le site étant statique, le stock n’est **pas synchronisé en temps réel** entre les navigateurs des joueurs. `catalogue.json` reste la source officielle du stock publié.

## Filtres et favoris

La boutique propose notamment :

- recherche texte ;
- catégorie et sous-catégorie ;
- rareté ;
- prix minimum et maximum ;
- filtre `Sélection d’Alaric` / `Catalogue de base` ;
- tri avec la sélection d’Alaric en premier ;
- favoris stockés dans le navigateur.

Les favoris ne contiennent que les IDs des objets. Changer de catalogue entre deux rencontres ne provoque donc pas d’erreur : un objet absent n’est simplement plus affiché. S’il revient plus tard avec le même ID, il reste favori.

## Panier

Le panier est stocké dans le navigateur avec `localStorage`. Il n’y a pas de paiement réel ni de serveur applicatif.

Le bouton **Copier pour Roll20** génère la commande :

```text
!co-alaric panier --target @{target|PJ|character_id} --data ...
```

Le fonctionnement Roll20 existant n’a pas été modifié : CoFItem reste responsable de la validation mécanique des objets.

## Utilisation locale

Les navigateurs bloquent souvent `fetch()` lorsqu’un fichier HTML est ouvert directement avec `file://`.

Pour tester le site localement, lance par exemple depuis le dossier du projet :

```bash
python -m http.server 8000
```

Puis ouvre :

```text
http://localhost:8000/
```

et pour le gestionnaire MJ :

```text
http://localhost:8000/stock.html
```

Si `stock.html` est malgré tout ouvert directement depuis le disque, l’import manuel permet de sélectionner `catalogue.json`.

## Mise en ligne avec GitHub Pages

1. Crée ou utilise ton dépôt GitHub.
2. Place les fichiers à la racine du dépôt.
3. Va dans `Settings > Pages`.
4. Source : `Deploy from a branch`.
5. Branche : `main`.
6. Dossier : `/root`.

L’adresse ressemblera à :

```text
https://ton-pseudo.github.io/boutique-alaric/
```

## Assets

Les visuels de header/footer sont servis en WebP. Les icônes du catalogue ont été redimensionnées à 128 px, largement suffisant pour leur taille d’affichage tout en réduisant fortement le poids du site.
