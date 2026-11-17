# AlaricCode — mise à jour du catalogue : 12 affixes spécialisés

**Source** : `documentation/source/COFantasy_Catalogue_Propre_12_Affixes_Predicats_Cibles.xlsx`.

## Changements

Le nouveau catalogue remplace **4 affixes d’accessoires génériques** :
`ACC_ATT_1`, `ACC_ATT_2`, `ACC_DM_1`, `ACC_DM_2`,
par **12 affixes typés** dans trois domaines (contact, distance, magie),
avec +1 / +2 aux attaques et aux dégâts :

- `ACC_ATT_CAC_1`, `ACC_ATT_CAC_2`, `ACC_DM_CAC_1`, `ACC_DM_CAC_2` ;
- `ACC_ATT_DIST_1`, `ACC_ATT_DIST_2`, `ACC_DM_DIST_1`, `ACC_DM_DIST_2` ;
- `ACC_ATT_MAG_1`, `ACC_ATT_MAG_2`, `ACC_DM_MAG_1`, `ACC_DM_MAG_2`.

Les nouveaux affixes sont compatibles avec `ACC-01` (anneau) et `ACC-05` (gants/gantelets). Leurs fiches conservent les noms RP, effets, descriptions, paliers, coefficients et prix validés dans le classeur.

| Élément | Ancien | Nouveau |
|---|---:|---:|
| Objets de base | 75 | 75 |
| Affixes | 517 | 525 |
| Liaisons objet-affixe | 2 259 | 2 275 |
| Fiches du catalogue | 2 334 | 2 350 |
| Prix actifs publiables | 2 150 | 2 166 |
| Stock initial | 54 | 54 |

Le bouton de création MJ affiche les douze variantes. Le moteur de prix reprend les montants officiels pour chacun des 24 nouveaux couples anneau/gants + affixe. `shared.js` accepte les nouveaux effectifs et embarque désormais, dans la spécification transmise avec la commande `!co-alaric panier`, le champ `config[ID_AFFIXE].predicat` exact fourni dans le classeur.

**Important pour Roll20 :** le site transmet le prédicat officiel (`bonusAttaqueContactEquipement:1`, etc.), mais **la prise en charge réelle par le script Roll20 externe n'a pas été vérifiée ici**. Les données sont préparées, aucune garantie d'application automatique des bonus n'est donnée par la boutique elle-même.

## Compatibilité et correctifs conservés

- Les **12 élixirs de caractéristiques** continuent d'utiliser le correctif site **V10.5.1** : P2/P4, coefficient 1,25 et prix antérieurs inchangés. Le fichier Excel fourni reprend, pour ces seuls élixirs, les anciens paliers P1/P3 et coefficients 1/0,9. La version de catalogue destinée au site normalise explicitement ces 12 valeurs pour éviter une régression.
- Le symbole du malus des boucliers/armures (signe « − ») et les libellés UI retouchés auparavant sont préservés.
- **Aucune donnée Firebase n'est effacée ni modifiée par cette archive** : stocks des deux groupes, historiques et créations déjà publiées sont préservés.
- Une création MJ déjà publiée avec l'un des **quatre anciens IDs** ne peut pas être convertie automatiquement en contact/distance/magie (information absente de l'ancien affixe). Elle devra être **corrigée ou recréée manuellement par le MJ** si elle est encore utilisée. Le nouveau catalogue ne permet plus de créer ces quatre affixes génériques.

## Installation

1. Décompresser l'archive et déployer le contenu du dossier `AlaricCode` à la place des fichiers publics existants, sur GitHub Pages (ou l'hébergement en place).
2. Recharger la boutique et l'interface MJ sans cache (`Ctrl+F5`).
3. Vérifier dans **MJ → Création d'objets** les douze variantes pour un anneau et des gants, ainsi que leurs prix.
4. Vérifier le panier dans chaque boutique. Pour une synchronisation des tarifs Firebase déjà publiés, utiliser les commandes de publication du livre des prix de l'interface MJ, avec les droits habituels.
5. Tester l'exécution du prédicat avec le script Roll20 réellement installé avant utilisation en partie.

Les règles Firestore ne changent pas. Les tests automatiques JS sont disponibles dans `tests/` et se lancent avec `node --test tests/*.test.js`.
