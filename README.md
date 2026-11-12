# AlaricCode — remplacement intégral à la racine

Cette archive remplace l'ancienne application : **aucun dossier `v3/`**, aucun ancien fichier JavaScript ni CSS n'est nécessaire au fonctionnement.

## Structure

- `index.html` : vitrine par défaut du groupe 1 (`?groupe=groupe1` ou `?groupe=groupe2`).
- `groupe1.html` : lien dédié aux joueurs du groupe 1.
- `groupe2.html` : lien dédié aux joueurs du groupe 2.
- `mj.html` : gestion sécurisée des stocks, objets, affixes, imports/exports.
- `config.js` : connexion Firebase publique, déjà configurée pour `alaricstock-c51d1`.
- `shared.js`, `vitrine.js`, `mj.js`, `style.css`, `vitrine-classique.css` : application entière.
- `data/base-items.json` : **catalogue de base autonome** préparé depuis le classeur (objets standards, 7 ajouts demandés, ancien carquois de 20 flèches retiré).
- `data/templates.json`, `data/affixes.json` : modèles et affixes du catalogue fourni.
- `icons/` : SVG transmis et variantes colorées, avec icônes génériques de secours.
- `assets/` : nouvelle bannière SVG et ornement du thème violet/or pour ne pas dépendre d'anciens assets.
- `firestore.rules` : règles Firestore à adapter avec l'UID du MJ.

## Installer en remplacement total

1. **Sauvegarder** le dépôt actuel via GitHub → Code → Download ZIP, et conserver le CSV Supabase. Faire une sauvegarde/export Firestore si possible. Les données Firestore ne seront pas supprimées lors de la mise à jour de GitHub Pages.
2. Depuis GitHub Desktop (conseillé), cloner le dépôt `dagga78180/AlaricCode` ou ouvrir le clone existant.
3. À la racine locale, **supprimer les fichiers de l'ancienne boutique et le répertoire `v3/`**. Ne supprimer **ni le dossier `.git`**, ni les configurations GitHub Pages nécessaires en dehors de l'app. Ne pas supprimer le dépôt entier.
4. Décompresser **le contenu** de ce ZIP directement à la racine du dépôt (PAS un dossier parent, PAS `v3/`).
5. Vérifier que `index.html`, `groupe1.html`, `groupe2.html`, `mj.html` sont directement à la racine, puis Commit et Push vers `main`.
6. Dans Firebase Console → Firestore Database → Règles, reprendre `firestore.rules` et remplacer `REMPLACE_PAR_TON_UID_MJ` par l'UID exact du MJ, puis Publier. **Ne pas publier la valeur placeholder.**
7. Ouvrir `https://dagga78180.github.io/AlaricCode/groupe1.html`, puis `/groupe2.html`, puis `/mj.html` ; tester la connexion MJ, la séparation des quantités et le panier.

## Important : groupes et reprise des stocks

L'ancienne collection `stocks` de Firestore n'est pas modifiée. Les deux nouvelles collections sont `groups/groupe1/stocks` et `groups/groupe2/stocks`. Dans `mj.html` → Import / export, tu peux copier l'ancien stock **dans un groupe choisi**, sans l'écraser s'il existe déjà. Répéter uniquement si tu souhaites les mêmes données de départ dans l'autre groupe.

Le catalogue de base est **reconstitué depuis le classeur fourni**, pas une copie exacte du dernier `catalogue.json` de ton ancien dépôt, auquel nous n'avons pas accès sous sa version récente. Il contient les équipements usuels et les 7 ajouts demandés. Les créations MJ déjà présentes dans les collections `groups/.../customItems` restent gérées par Firebase. Si tu utilisais d'autres objets personnalisés **uniquement dans un ancien fichier JSON GitHub**, il faudra les réimporter depuis ta sauvegarde ; ils n'apparaissent pas automatiquement dans ce ZIP.

Les illustrations anciennes qui ne figuraient pas parmi les 12 SVG fournis sont remplacées par des pictogrammes de catégorie. La bannière violette et or a été refaite en SVG ; ce n'est pas une copie pixel pour pixel de l'ancienne image non disponible localement.

## Monnaies

1 PO = 100 PA = 10 000 PC, 1 PA = 100 PC. Tous les prix sont stockés en PC entiers ; flèche normale = 20 PC. Le bâton courant est repris à 1 PA depuis l'ancien catalogue public. Les prix non renseignés dans le classeur restent `Prix à définir` et ne sont pas commandables avant modification dans la page MJ.

## Sécurité

Le lien `mj.html` est visible mais seuls les comptes Firebase autorisés par les règles Firestore peuvent enregistrer des stocks et des objets. Une copie du fichier `firestore.rules` seule ne publie pas les règles ; elles doivent être configurées dans la console Firebase.

## Tests recommandés

- Vérifier que les deux vitrines affichent des stocks différents et que les paniers sont indépendants.
- Modifier une quantité dans `mj.html` et contrôler uniquement le groupe ciblé.
- Copier une commande ; vérifier le calcul des PO/PA/PC.
- Créer un objet test avec un affixe et le supprimer ensuite.
- Importer un JSON test dans un seul groupe.

**Ne pas supprimer l'ancienne base Firebase avant d'avoir vérifié les deux vitrines.**
