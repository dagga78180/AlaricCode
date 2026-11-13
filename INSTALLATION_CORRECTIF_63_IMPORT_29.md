# Alaric Code — correctif sur la VRAIE archive du site (13 novembre 2026)

Source utilisée : `AlaricCode (2)(1).zip` fourni par le MJ. Cette archive de livraison **n'embarque pas le dossier `.git/`** : conserver le dépôt Git d'origine et copier les fichiers mis à jour dans sa racine.

## Ce qui a été changé

- `data/stock-base-alaric-v2.json` : **63 références** au lieu de 68, retrait exclusif de `CO_ELIXIR_CHA_2`, `CO_ELIXIR_CON_2`, `CO_ELIXIR_DEX_2`, `CO_ELIXIR_FOR_2`, `CO_ELIXIR_INT_2`.
- `shared.js` : valide désormais le stock initial de 63 références. Les 75 bases, 536 affixes et 2 278 associations restent chargés pour la création MJ.
- `mj.js` : importeur JSON reconnaissant les IDs V2 (`cac-02`, `arm-02`, etc.) et les variantes `templateId`, `modele` ou `cofSpec.base`. Contrôle Q, affixes autorisés, prix en PC, limites et stock. Affiche le **numéro de ligne et l'étape** en cas de refus, notamment Firebase.
- `mj.html`, `index.html`, `groupe1.html`, `groupe2.html` : paramètres de version sur les scripts locaux pour éviter que le navigateur recharge l'ancien importeur depuis son cache ; exemple de JSON dans l'interface MJ mis à jour.
- `exemple-import.json` : exemple compatible avec les vrais modèles V2.
- `selection-alaric-29-QP-IMPORT.json` : **29 équipements** (20 R1, 7 R2, 2 R3) avec 6 Q1, 14 P1, 2 Q2, 3 P2, 2 Q1+P1, 1 Q3, 1 P3, et **stock de 1 exemplaire par équipement**.

Les **noms et descriptions RP**, les icônes, les scripts de prix, les paramètres Firebase et la commande d'export `!co-alaric panier` sont conservés tels que dans ton ZIP d'origine.

## Installation

1. Conserver une copie du dépôt/site existant et des données de ta campagne.
2. Ouvrir le ZIP de livraison. Copier **le contenu** du dossier `AlaricCode/` à la **racine du dépôt GitHub Pages** existant, sans créer un nouveau sous-dossier. Conserver le `.git` et les éventuels fichiers propres à ton dépôt.
3. Publier les modifications et recharger `mj.html` avec `Ctrl+Maj+R` (ou en navigation privée).
4. S'authentifier dans l'espace MJ et **choisir le groupe voulu** (`Groupe 1` ou `Groupe 2`). Cliquer sur **Import / export**.
5. Charger `selection-alaric-29-QP-IMPORT.json`. Cliquer **Vérifier la liste** : la prévisualisation doit indiquer **« 29 objets valides »**. Puis cliquer **Importer dans ce groupe** et confirmer.
6. Au terme de l'opération, vérifier **« 29 objets importés »** ; rechercher les IDs `mj-alaric-r1-01-cac-02` et `mj-alaric-r3-29-...` dans les stocks.
7. Contrôler depuis la vitrine que les cinq élixirs **supérieurs** ne figurent plus dans le **stock de base**. Les affixes supérieurs restent disponibles dans le catalogue pour créer des objets MJ si nécessaire.

## Si l'enregistrement est refusé

**Prévisualisation refusée :** l'interface indique maintenant `Ligne N` ainsi que le modèle, l'affixe, la qualité ou le prix problématique.

**Import interrompu après prévisualisation :** le message indique la ligne exacte, l'ID et l'étape d'écriture (`création de la fiche`, `visibilité`, `quantité de stock`). Lors d'un refus `permission-denied`, vérifier la connexion MJ et les **règles Firestore réellement publiées**. Dans le fichier `firestore.rules` de l'archive fournie, la fonction `isMJ` contient `REMPLACE_PAR_TON_UID_MJ` : **ne pas publier ce fichier de règles tel quel**. Si tu l'as déjà déployé ainsi, l'écriture de la sélection sera refusée. Ce patch **ne modifie pas les règles de sécurité** et ne suppose pas quel est ton UID.

Si une tentative échoue après quelques objets, relancer le **même JSON** permet de mettre à jour les mêmes IDs sans créer de doublons. Il ne s'agit pas d'une transaction atomique ; les objets précédents peuvent être déjà enregistrés dans le groupe concerné.

Le stock par défaut est illimité tant qu'une quantité n'est pas configurée. Les **créations MJ déjà enregistrées dans Firebase** ne sont ni supprimées ni migrées. Si tu avais déjà créé des élixirs supérieurs via l'éditeur MJ, ils resteront visibles jusqu'à retrait manuel.

## Contrôles automatiques

Le code réel de `shared.js` et **la vraie fonction `parseList()` de `mj.js`** ont été exécutés avec les JSON de cette archive et une simulation de Firestore (aucune opération à distance). Contrôles réussis : **63 références de base**, **29/29 équipements**, prix, qualités et affixes, écritures de 29 objets + quantités dans un seul groupe, réimportation sans doublons, détection de mauvais modèle/affixe/qualité et message de refus Firestore simulé. Les 20 R1 / 7 R2 / 2 R3 sont vérifiés.

**Limite :** le test réel sur l'hébergement et le compte Firebase du MJ n'a pas été effectué ; la réussite d'une transaction à distance dépend notamment des règles Firestore en vigueur.
