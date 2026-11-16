# AlaricCode V10.5 — Catalogue final synchronisé

**Source officielle :** `COFantasy_Catalogue_Sain_Final_Noms_Materiaux_Grenades(6).xlsx`.

## Modifications

- Référentiel intégral actualisé : **75 objets de base, 517 affixes, 2 259 liaisons, 2 334 fiches joueur**.
- **2 150 liaisons tarifaires actives** utilisables dans le créateur et le calcul de prix Q/P.
- Noms, effets, descriptions RP, caractéristiques, publication, raretés calculées, qualité et prix des sources JSON de catalogue synchronisés avec le classeur.
- Le créateur utilise le nom officiel des liaisons. Exemple : `ACC-01|ACC_MOD_CON_1` devient **Anneau de l'endurance de l'Ours**. `DST-01|N32` devient **Arc court à encoche rapide**.
- Les créations automatiques à affixe unique déjà présentes dans Firestore sont rafraîchies **à l'affichage** (nom, RP, affixe), sans écrire ni modifier leurs prix ou stocks. Les créations multi-affixes et les importations non standard restent intactes.
- Le jeu de données contient les annexes `MATERIAUX RD`, `LIGNEES RP`, `GRENADES` pour permettre l'audit des noms RP ; il n'y a pas de nouvelle interface pour ces annexes.

## Point d'attention : ancien poison retiré

Le classeur final retire **19 affixes et 19 liaisons** (ancienne série de poisons, grenades et résistances). L'ancienne sélection de départ contenait une variante `CON-07|CO_POISON_1` qui n'existe plus dans le catalogue officiel : elle a donc été retirée **de la liste statique affichée en boutique**, passée de 63 à **62 références**. Les documents de stock et les achats historiques déjà enregistrés dans Firestore ne sont ni supprimés ni modifiés. S'il faut réintroduire cet article, il faudra définir un tarif et un affixe officiel valides, sans inventer une correspondance.

## Installation GitHub Pages

1. Depuis l'espace MJ actuel, réalise d'abord un **export/sauvegarde JSON** de tes deux groupes.
2. Décompresse le ZIP V10.5 et remplace les fichiers de ton dépôt GitHub Pages par le contenu du dossier `AlaricCode/` (y compris `data/`, `shared.js`, `mj-v5.js` et `js/`).
3. Attends la publication de GitHub Pages, puis recharge la page en forçant l'actualisation (`Ctrl+F5`). Les références aux scripts JS ont été versionnées pour éviter la mise en cache de l'ancienne version.
4. Vérifie dans le **créateur MJ** l'anneau `ACC-01 + ACC_MOD_CON_1`, l'arc `DST-01 + N32`, et les prix correspondants.
5. Dans la **Vue d'ensemble MJ**, utilise **Comparer les tarifs / Restaurer les prix officiels** après examen, si Firestore contient encore d'anciens prix personnalisés. Publie ensuite le livre de prix du ou des groupes concernés avant de vendre des objets à leur nouveau tarif.

## Firebase et sécurité

- **Aucun changement de règles Firestore n'est requis par cette mise à jour du catalogue.** Elle n'ajoute pas de nouvelle collection ni de nouveau type d'écriture.
- Les règles Firestore de la V10.3/V10.4 doivent néanmoins être correctement publiées et contenir le vrai UID MJ pour autoriser les commandes d'administration. Si tu vois `Missing or insufficient permissions`, c'est une erreur de droits Firebase indépendamment de ces fichiers de catalogue.
- Le déploiement de fichiers statiques **ne réécrit pas les anciens documents Firestore**. Les surcharges de prix et les stocks de groupe gardent leurs valeurs jusqu'à une action explicite dans la gestion MJ. De même, les exports bruts Firestore peuvent encore contenir les anciens noms d'anciennes créations, même si l'écran utilise le nom officiel à l'affichage.
- Les paramètres Firebase et les commandes Roll20 sont conservés.

## Fichiers de référence

- `data/catalogue-objets-v2.json`
- `data/catalogue-affixes-v2.json`
- `data/catalogue-liaisons-v2.json`
- `data/catalogue-rp-nouveau.json`
- `data/pricing-model.json`
- `data/catalogue-officiel-reference-2026.json` : copie consultable des 4 tableaux sources.
- `data/catalogue-annexes-rp-2026.json` : tableaux RP complémentaires.
- `RAPPORT_SYNCHRONISATION_CATALOGUE_V10_5.json` : changements détaillés.

Les anciens fichiers `catalogue-prix-anciens.json` et `catalogue-prix-precedents-v6.json` sont conservés uniquement pour détecter les anciennes surcharges. Ils ne définissent plus les prix officiels du créateur.
