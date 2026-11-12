# AlaricCode — V4, interface V2 conservée

**INSTALLATION** : sauvegarde d’abord le dépôt. Place le contenu de cette archive directement à la racine de GitHub Pages, sans dossier `v3/`. Conserve la configuration GitHub Pages.

## Adresses
- `index.html` et `groupe1.html` : boutique groupe 1 ; `groupe2.html` : boutique groupe 2
- `mj.html` : espace MJ (authentification Firebase, pas de mot de passe dans le code)

## Collections Firestore
- `groups/groupe1/stocks` et `groups/groupe2/stocks` : quantités (absence de document = illimité)
- `groups/{groupe}/customItems` : objets de la sélection MJ par groupe
- `groups/{groupe}/baseOverrides` : visibilité et prix personnalisés d’un objet de base ou sélection d’origine.
- Les 12 anciens objets de la Sélection d’Alaric sont conservés dans `data/catalogue.json`; les modifier ou les retirer dans l’espace MJ pour le groupe choisi (leur version historique reste archivée dans le JSON).

**IMPORTANT** : remplace `REMPLACE_PAR_TON_UID_MJ` dans `firestore.rules` par le UID de ton compte Firebase, puis publie les règles Firestore AVANT de tester les créations et modifications. Les anciennes données ne sont pas supprimées. Pour recopier tes stocks historiques, utilise le bouton dédié une seule fois sur le groupe choisi.

## Icônes : P et Q
- Les **1 530 images PNG V2** et le `manifest.json` sont conservés dans `assets/icons/`.
- Niveau d’icône **R = min(10, Q + Pmax)**, avec qualité Q0–Q5 et Pmax (palier maximum des affixes) de P0–P5. R00…R10 utilisent la variante correspondante dans le manifeste historique. Cette règle est identique pour les icônes PNG V2 et SVG V3. Le niveau Pmax est le plus haut palier parmi les affixes sélectionnés ; ce n’est jamais leur somme.
- Les 52 nouvelles icônes SVG se trouvent dans `assets/icons/alaric-nouvelles/`. Chaque dessin existe en **11 versions R00 à R10**, dont les couleurs reprennent la palette V2 (`assets/icons/palette.json`). La couleur principale de l’élément reste reconnaissable. Le site choisit automatiquement `<identifiant>_Rxx.svg` en fonction de Q et Pmax, même pour les créations et imports MJ. Les autres images personnalisées restent inchangées.

## Monnaie
- 1 PO = 100 PA ; 1 PA = 100 PC. Tous les prix Firebase sont en PC entiers.
- Les valeurs chiffrées des objets de base proviennent du classeur `Catalogue_objet_Magique.xlsx` quand une valeur est renseignée ; la flèche standard est définie à **20 PC** selon ta consigne. Les prix manquants restent à définir.
- Le bouton de calcul de l’éditeur est basé sur le **moteur V2 `data/pricing-model.json`** ; le calculateur figé dans la feuille source ne définit pas une formule exploitable complète pour toutes les combinaisons. Le prix reste modifiable par le MJ et l’estimation n’est pas présentée comme certifiée par le nouveau classeur.

## Fonctionnalités V2
Vitrine HTML/CSS d’origine : filtres, favoris, panier, macro Roll20 pour les objets compatibles. Si une commande contient un objet personnalisé sans spécification Roll20 exploitable, le bouton copie une liste de commande lisible à transmettre au MJ. Les paniers sont séparés par groupe dans le navigateur.

## Tester sans casser les données
1. Déploie la page ; vérifie les images d’une arme commune et d’un objet P/Q non nul.
2. Connecte-toi dans `mj.html`, sélectionne groupe 1, règle le stock d’un seul objet.
3. Vérifie la quantité dans `groupe1.html` et l’absence de changement dans `groupe2.html`.
4. Essaie la création puis la suppression d’un objet de sélection, et un import JSON de test.

**Aucune écriture dans la base n'est effectuée par le ZIP : les changements Firebase ne commencent que lors de tes actions dans l’interface.**

Le catalogue de base est **toujours visible** dans les deux groupes : l’espace MJ ne propose pas de le masquer. La Sélection d’Alaric est modifiable et ses stocks restent séparés.

Parchemin de stabilisation : prix V2 conservé à 150 PA et spécification Roll20 historique B066, avec référence de vitrine B062 conforme au nouveau catalogue.
