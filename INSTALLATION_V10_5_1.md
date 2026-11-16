# AlaricCode V10.5.1 — Palier des élixirs / retrait du stock initial

**Source** : `COFantasy_Catalogue_Sain_Final_Noms_Materiaux_Grenades(6)(2).xlsx`.

## Mise à jour du catalogue

- Douze élixirs de caractéristique (six caractéristiques, deux intensités) : P1 → P2 pour l'effet +1, P3 → P4 pour l'effet +2 ; coefficient des douze : **1,25**.
- Les textes d'effet (+1/+2) restent identiques.
- Le classeur conserve les prix **35 PA** et **151,20 PA**. Ils ne sont pas recalculés arbitrairement.
- Huit articles sortent du **stock initial** : six élixirs normaux, `CON-08|CO_GRE_FEU_1` (Grenade de feu), `CON-10|CO_DEF_3` (Potion de défense).
- **54 articles** dans la sélection initiale au lieu de 62.
- Ces huit références restent dans les données du catalogue et dans le créateur MJ.

## Mise en ligne

1. Dézipper et déployer le contenu du dossier `AlaricCode` sur GitHub Pages, en écrasant les anciens fichiers.
2. Rafraîchir le site sans cache (Ctrl+F5).
3. Vérifier Boutique / Création d'objets : les huit articles ne doivent plus apparaître comme références initiales, mais restent sélectionnables dans le créateur.
4. Si un ancien objet existe **comme création MJ publiée**, il reste affiché : cette version ne supprime pas de document Firestore, et il faut le retirer explicitement depuis l'interface MJ si souhaité.
5. Si tu souhaites nettoyer le livre des prix Firestore de ces huit références, le MJ doit republier le livre des prix une fois les droits en place. La liste visible dans la boutique est déjà filtrée côté code.

**Aucune modification des règles Firestore pour cette mise à jour** (aucun nouveau champ ou chemin). En revanche les droits MJ existants doivent fonctionner pour republier des prix.

**Protection des données** : aucune écriture Firebase automatique, les stocks G1/G2 et achats historiques ne sont pas touchés.

**Remarque de cohérence Excel** : les colonnes P des feuilles AFFIXES et CATALOGUE sont à 2/4. La feuille LIAISONS conserve son ancien palier 1/3 dans le classeur importé ; le JSON du site est normalisé sur AFFIXES/CATALOGUE pour rester cohérent. Les prix officiels n'ont pas changé.
