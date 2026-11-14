# Installer AlaricCode V5 — sans Cloud Functions

Cette version conserve la boutique joueur V4 et remplace seulement l'interface MJ. Elle fonctionne avec **Firebase Firestore sur Spark (gratuit dans les quotas)**, sans `npm`, sans Cloud Functions et sans activation de Blaze.

## 1. Avant de remplacer les fichiers

- Conserve une copie locale de ton ancien dossier AlaricCode.
- Vérifie ton projet Firebase dans `config.js`. La V5 reprend la configuration de la V4 fournie : le projet n'a pas été migré.
- Dans **Firebase Console > Firestore Database > Règles**, garde ton **UID MJ réel** et les autorisations nécessaires aux achats de la V4. Le fichier `firestore.rules` livré contient `REMPLACE_PAR_TON_UID_MJ` comme placeholder : **ne le déploie jamais tel quel**.
- Si la V4 Spark est déjà utilisée par les joueurs et fonctionne, ses règles Firestore peuvent être conservées pour la V5. La V5 ne crée pas de nouveau chemin de données ni de collection supplémentaire ; elle réutilise les données existantes.
- L'authentification anonyme est utilisée par la boutique joueur V4. Le MJ conserve son compte e-mail / mot de passe Firebase Authentication.

## 2. Mettre à jour le site

1. Décompresse l'archive complète dans un dossier.
2. Remplace les fichiers de ton site hébergé (GitHub Pages ou autre hébergement statique) par ceux de **AlaricCode/**.
3. Garde la structure de dossiers `data/`, `assets/` et `js/` : ne déplace pas les fichiers individuellement.
4. Ouvre `mj.html` et connecte-toi avec ton compte MJ.
5. Vérifie que les compteurs des **deux groupes** s'affichent et que le bandeau des prix ne présente aucune erreur.
6. Dans **Vue d'ensemble**, clique au besoin sur **Actualiser les prix des deux groupes**. Les prix sont aussi actualisés après chaque modification enregistrée.
7. Vérifie les vitrines `groupe1.html` et `groupe2.html`.

**Aucun `npm install` et aucune fonction Firebase à déployer.**

## 3. Premier test prudent

1. Sélectionne « Groupes 1 et 2 » en haut de l'espace MJ.
2. Dans Catalogue, choisis un objet sans importance, note son stock actuel, change le stock de chaque groupe et clique **Enregistrer**.
3. Ouvre les deux vitrines et vérifie que chaque groupe présente la bonne valeur.
4. Essaie de masquer puis réafficher l'objet : les deux vitrines doivent suivre les règles choisies.
5. Crée un objet de test dans l'Atelier avec stock 1 dans chaque groupe ; vérifie les prix affichés et la commande Roll20 générée par les vitrines.
6. Réalise un achat d'essai : première validation, survalidation, stock diminué dans le bon groupe, commande Roll20 uniquement **copiée** (jamais exécutée par Alaric).
7. Sauvegarde les données via l'onglet **Sauvegardes** avant toute importation massive.

## 4. Tableau de gestion

- Les deux groupes sont visibles côte à côte. Le sélecteur supérieur détermine **où l'on peut modifier**.
- Pour changer le stock ou le prix, saisis la valeur puis clique **Enregistrer les modifications**. Un stock vide signifie **illimité**. Les prix du tableau sont en **PA**, les données Firestore restent en **PC**.
- Pour appliquer une quantité commune à plusieurs objets, sélectionne les lignes, choisis **Définir le stock** ou **Ajouter au stock**, applique, puis corrige les champs G1 ou G2 et enregistre.
- Pour retirer des créations MJ, utilise **Supprimer / retirer** avec les deux confirmations. Les objets de base sont **masqués**, pas supprimés des JSON de base.
- Lorsqu'une création MJ n'existe que dans un groupe, un bouton **Ajouter** permet de la copier dans l'autre groupe.

## 5. Atelier MJ

La qualité et les affixes déterminent le nom, les statistiques dérivées du modèle, les effets, la rareté et le prix. Le format Roll20 reste la référence technique. Les combinaisons de plusieurs affixes et/ou avec qualité ont un **prix automatique estimé**, pas une valeur officielle du catalogue. Les affixes nécessitant une configuration Roll20 non disponible sont bloqués, pour éviter une commande invalide.

## 6. Importer un JSON

Le format de la V4 est conservé. Colle le texte ou ouvre un fichier, clique **Analyser et prévisualiser**, sélectionne chaque ligne et ouvre son détail. Pour les doublons, choisis **Ignorer** ou **Remplacer** séparément pour Groupe 1 et Groupe 2. Lorsqu'un doublon est remplacé, le **stock et le prix** du groupe concerné sont conservés. L'import peut être partiel en cas de coupure réseau : relis le bilan et vérifie le catalogue avant de recommencer.

## 7. Sauvegarder ou restaurer

- **Exporter** télécharge un fichier JSON avec les créations MJ, les stocks limités et la visibilité / les prix personnalisés des deux groupes.
- **Restaurer** vérifie la structure, affiche le contenu et demande **deux confirmations**. Une restauration peut supprimer les créations absentes du fichier et remplacer les stocks courants : fais-la **hors séance**, sans achats simultanés.
- Les commandes déjà enregistrées et l'historique des joueurs ne sont pas restaurés, ni effacés par cette fonction.
- La restauration applique les documents progressivement : une erreur réseau peut produire une restauration incomplète. Conserve toujours le fichier de sauvegarde et vérifie les deux boutiques après l'opération.

## 8. Sécurité, coûts et limites

- Spark : pas de carte bancaire nécessaire, mais limites d'usage Firestore/Authentication. En cas de dépassement, des opérations peuvent être suspendues jusqu'au rétablissement du quota.
- Les opérations MJ sont protégées par les **règles Firestore et ton UID MJ**, et non par le seul lien `mj.html`.
- La commande Roll20 est un **texte copiable** ; le site ne l'envoie pas et ne l'exécute pas.
- Le moteur de stock joueur utilise les transactions Firestore de la V4. Vérifie soigneusement ces transactions et les règles sur ton **projet de test / vraie boutique** avant utilisation en production.

## Contrôles effectués pour cette archive

- Syntaxe JavaScript valide (`node --check`).
- Tests en navigateur Chromium avec Firebase **simulé** : chargement du catalogue des deux groupes, modifications de stocks, création et publication, import, décisions sur doublons, export et restauration.
- Aucune modification ni test direct sur ton véritable Firebase, aucune mise en ligne.
