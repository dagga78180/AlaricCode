# Alaric Code — Catalogue RP V1 et export Roll20

Cette mise à jour repose sur le catalogue V2 strict (75 bases, 536 affixes et 2 278 liaisons) **avec les noms et descriptions RP du classeur du 13 novembre 2026**.

La sélection du stock reste à 68 références (`data/stock-base-alaric-v2.json`), dont 17 consommables exacts ; les créations MJ sont conservées. Pour le stock, les noms et descriptions RP viennent des liaisons, les prix restent calculés à partir des champs techniques inchangés.

Les icônes des 75 bases — dont l'inversion corrigée des icônes Corde/Couverture —, les palettes R00–R10 et les couleurs des consommables ne sont pas modifiées.

**Installation :** fusionner ce dossier `Alaric/` avec le site existant. Conserver le HTML, CSS, la configuration Firebase et les données Firestore. Voir `../INSTALLATION_COFANTASY_ALARIC_RP.md`.


## Correctif stock et import (13/11/2026)
- Base : 63 références, cinq élixirs supérieurs retirés (conservés dans les 536 affixes de l’éditeur MJ).
- Éditeur MJ : import des modèles V2, des qualités Q, des affixes et des prix (exemple actualisé).
- Sélection : `selection-alaric-29-QP-IMPORT.json` ; cliquer Vérifier la liste avant Importer.
- En cas de refus à l’écriture, le message précise la ligne, l’étape et l’erreur Firestore.
- Aucune mise à jour automatique ni suppression de documents Firebase.

## Mise à jour de novembre 2026 — import 29 et stock 63

Voir `INSTALLATION_CORRECTIF_63_IMPORT_29.md`. La sélection à charger dans l'espace MJ est `selection-alaric-29-QP-IMPORT.json`. Le stock initial contient 63 références et exclut les 5 élixirs supérieurs, sans les supprimer du catalogue MJ.
