# AlaricCode V10.4 — Installation et migration

## À FAIRE AVANT DE DÉPLOYER

**IMPORTANT : les nouvelles fonctions MJ utilisent les autorisations Firestore déjà prévues par la V10.3.** Si les règles de la V10.3 ne sont **pas encore publiées** avec ton véritable UID MJ, **le site affichera « Missing or insufficient permissions »**. Mettre le ZIP sur GitHub Pages ne publie pas les règles Firestore.

1. **Sauvegarde** tes règles en ligne et tes données avant de toucher à la production. Le ZIP V10.4 ne doit pas être utilisé pour restaurer tes anciens stocks sans vérification préalable.
2. Dans Firebase Console → Firestore Database → **Règles**, vérifie que les chemins utilisés sont autorisés pour le MJ : `groups/{groupId}/stocks`, `groups/{groupId}/customItems`, `groups/{groupId}/baseOverrides`, `groups/{groupId}/storefront/{bookId}`, `groups/{groupId}/privateSettings/{settingId}` et `groups/{groupId}/secretShelves/{token}`.
3. **Vérifie `isMJ()`** et remplace le placeholder `REMPLACE_PAR_TON_UID_MJ` par l’UID du compte MJ (voir dans `mj.html` → Vue d’ensemble → Configuration et paramètres techniques). Vérifie qu'il s'agit du bon projet Firebase.
4. **Publie** les règles dans la console Firebase. Modifier le fichier `firestore.rules` dans ton dépôt ne change pas les autorisations en ligne.
5. Si tes règles V10.3 complètes avec le bon UID sont **déjà publiées**, cette V10.4 **ne requiert pas de nouveau schéma ni de nouveaux champs Firestore**. N'écrase pas des règles existantes personnalisées sans les comparer.

Les joueurs ne doivent jamais obtenir de droits d'écriture sur les prix, les rayons ou les créations MJ. Le mot de passe du rayon Secret donne un accès **interface**, il ne chiffre **pas** les fiches présentes dans le catalogue public.

## Installer le site

1. Décompresse le ZIP ; publie les fichiers du dossier `AlaricCode/` dans ton dépôt GitHub Pages **en conservant leur arborescence**. Laisse ton `config.js` pointant vers le bon projet Firebase.
2. Fais un rechargement forcé (`Ctrl + F5`) de `mj.html` et des pages des deux groupes.
3. Connecte-toi avec le compte Firebase MJ. Vérifie le message de chargement dans l’administration.
4. Ouvre **Gestion des rayons** : déplace un objet test d’un groupe seulement vers Promotions, indique un pourcentage, et ajuste un stock de test. Clique **Enregistrer les modifications**.
5. Recharge la page et vérifie : l’objet est uniquement en Promotions pour le groupe ciblé ; son stock a changé seulement dans ce groupe ; l'autre groupe reste en Boutique ; le tarif affiché en Promotions est réduit.
6. Teste la commande Roll20 après achat dans un groupe de test, **sans exécuter la commande en direct dans Roll20**.
7. Teste le rayon secret en définissant une phrase de passe de **12 caractères minimum** dans Gestion des rayons, puis en la saisissant depuis la boutique joueur.

## Organisation MJ

- **Vue d’ensemble** : métriques, actions rapides, synchronisation / restauration des tarifs ; Configuration repliable tout en bas.
- **Gestion des rayons** : Boutique, Promotions, Secret ; glisser la **carte complète** pour G1+G2, ou la **pastille G1/G2** pour un seul groupe. Les zones « Déposer vers » restent accessibles si la liste est longue. Les menus de la flèche « Détails » remplacent le glisser-déposer sur téléphone. Saisir une quantité directement ; **vide = illimité**, `0` = épuisé ; enregistrer toutes les modifications en une fois.
- **Création d’objets** : recherche de modèle, qualité, affixes facultatifs repliables, aperçu, stocks G1/G2 et publication **sans redirection**. Import JSON dans un volet de ce même onglet.
- **Export** : JSON des deux groupes, des stocks, des créations, des surcharges et **des rayons avec leurs remises**. La restauration accepte les sauvegardes V10.4 et les anciennes V5/V10.3 version 1. Le fichier n'inclut **jamais le mot de passe ni son empreinte** ; un mot de passe doit donc déjà être configuré pour restaurer un rayon Secret non vide.

Les prix officiels sont conservés ; les promotions sont un **pourcentage** de remise appliqué lors de la vente, avec arrondi en PC. Les deux groupes conservent **leurs quantités indépendantes**. Les déplacements ne dupliquent aucun stock.

## Sécurité pendant les modifications

La gestion des stocks est effectuée dans une transaction Firestore qui refuse d'écraser un stock si sa valeur a changé après le chargement MJ (par exemple après un achat joueur). En cas de conflit, recharge la page, puis réapplique ta modification.

Les **tests sur le véritable projet Firebase** sont indispensables. Les contrôles de la version livrée ont été exécutés hors production avec Firestore simulé ; aucune écriture n'a été réalisée sur ton projet.
