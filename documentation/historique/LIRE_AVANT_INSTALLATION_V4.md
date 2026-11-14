# Alaric V4 Spark — Installation 100 % sans facturation et sans Cloud Functions

Cette édition conserve le site complet : **cartes V4**, recherche et filtres repliables, grille 4 / 2 / 1, favoris, espace MJ, stocks séparés pour les groupes 1 et 2, panier à **double confirmation**, commande Roll20 et historique personnel.

## Gratuité

Le projet fonctionne avec le forfait **Firebase Spark**, sans carte bancaire :
- **GitHub Pages** (site statique) ou hébergement statique habituel ;
- **Firebase Authentication** (connexion anonyme des joueurs, e-mail du MJ) ;
- **Cloud Firestore** (stocks, prix publiés par le MJ, commandes) dans ses quotas Spark.

Aucune Cloud Function, aucun serveur externe et **aucune commande `npm --prefix functions install`**. Le dossier `functions` et la dépendance à `firebase-functions` ont été supprimés. Si tu atteins les quotas du forfait Spark, le service concerné cesse de répondre ; il n'y a pas de facturation automatique tant que ton projet reste sur Spark. Vérifie le forfait dans la console Firebase.

## Étapes obligatoires — à réaliser dans cet ordre

### 1. Sauvegarde

Sauvegarde ton site GitHub Pages actuel et **copie les règles Firestore actuellement publiées**, ainsi que tes données de stock si possible. **Ne supprime aucune collection Firestore** : le ZIP ne contient pas les stocks réels de tes groupes et ne les réinitialise pas.

### 2. Activer les connexions anonymes

Console Firebase → **Authentication** → **Sign-in method** → activer **Anonymous / Anonyme**. Vérifier que le domaine du site est bien autorisé. Le compte e-mail du MJ reste utilisé dans `mj.html`.

### 3. Mettre à jour les règles Firestore

Console Firebase → **Firestore Database** → onglet **Règles**. Ouvre le fichier `firestore.rules` du ZIP.

**ATTENTION :** ce fichier comporte `REMPLACE_PAR_TON_UID_MJ`, une valeur d'exemple. Il faut **conserver ton UID MJ déjà présent dans tes règles actuelles**, sinon tu perdras les droits d'administration. Si tes règles actuelles contiennent d'autres collections ou autorisations, conserve-les et fusionne uniquement les blocs pertinents, plutôt que d'écraser aveuglément.

Les règles nouvelles autorisent les joueurs authentifiés à :
- créer un récapitulatif d'achat immuable ;
- diminuer **seulement** les stocks disponibles ;
- et seulement **dans la même transaction** qu'une commande de ce groupe, avec une quantité égale au stock déduit et un prix provenant du livre officiel du MJ.

Les joueurs **ne peuvent pas augmenter le stock, le rendre négatif, modifier les prix officiels, supprimer les stocks ou éditer une commande validée**. Le MJ conserve les droits sur ses objets, stocks et prix.

Clique sur **Publier** dans la console Firebase. **Pas de CLI ni de facturation nécessaire pour cette étape.**

### 4. Mettre le site à jour

Remplace les anciens fichiers par le contenu du ZIP : fichiers HTML, CSS, JS, JSON, images et les autres ressources. Ne mélange pas une ancienne version de `js/app.js` avec cette version : `js/checkout-free.js` doit être présent.

### 5. Publier les prix depuis l'espace MJ (UNE FOIS PAR GROUPE)

Après avoir déployé les règles et le site :

1. Ouvre `mj.html`, connecte-toi avec ton compte Firebase MJ.
2. Sélectionne **Groupe 1**, attends le message **« prix publiés pour Groupe 1 »**.
3. Sélectionne **Groupe 2**, attends le message **« prix publiés pour Groupe 2 »**.
4. Au besoin, clique sur **« Publier / actualiser les prix de ce groupe »**.

Le site publie une unique fiche `groups/{groupe}/storefront/priceBook` contenant les prix de ses objets disponibles. Cette fiche est protégée en écriture par les règles et **est automatiquement actualisée à chaque chargement de l'espace MJ et après ses modifications**. Si les prix ne sont pas publiés, les achats affichent une explication, sans retirer de stock.

### 6. Test prudent (sur un petit stock)

1. Depuis le MJ, donne à une référence **2 exemplaires** en Groupe 1.
2. Depuis la boutique Groupe 1, ajoute **1 exemplaire** au panier.
3. Clique **Valider mon panier** puis **Confirmer définitivement**.
4. Vérifie le récapitulatif, le stock devenu **1**, puis copie la commande `!co-alaric panier ...` et envoie-la sur Discord au MJ.
5. Recharge le site : **Retrouver ma dernière commande** doit redonner **la même** commande sans déduire un second exemplaire.
6. Vérifie que les stocks du Groupe 2 restent indépendants.
7. Dans Roll20, le MJ colle la commande dans le chat avec l'API COAlaric compatible ; le prix/argent du PJ doit être traité par le MJ.

## Fonctionnement

- Avant la confirmation définitive : **aucun stock déduit**.
- Au second clic : transaction Firestore atomique : lecture des prix publiés + stocks actuels, contrôle des quantités, enregistrement de la commande et déduction de tous les stocks limités **ou aucune opération**.
- Si le prix publié est différent, si un objet est supprimé ou si le stock est épuisé : message d'erreur, sans achat partiel.
- Une commande est immuable et identifiée par un UUID ; un second envoi du même panier avec le même ID **retrouve la commande existante**, sans nouvelle déduction.
- Un objet sans document de stock est considéré comme **illimité** ; aucune fiche de stock n'est créée pour lui.
- Le récapitulatif peut être retrouvé depuis le **même navigateur et la même session Firebase**. Effacer les données de navigation ou la session anonyme peut supprimer ce lien.
- Le bouton **Copier la commande Roll20** copie la commande `!co-alaric panier --target @{target|PJ|character_id} --data ...` complète, seule. Le joueur la **colle manuellement sur Discord** à l'attention du MJ.
- Le site ne déduit pas l'argent sur une fiche Roll20 et n'envoie pas de message Discord automatiquement.
- Limites Roll20 : jusqu'à 50 références, 100 unités par ligne, 200 exemplaires au total. Les transactions très volumineuses peuvent rencontrer les limites de lecture des règles Firestore ; fractionner un gros panier dans ce cas.

## Limite de confiance importante

**Cette version gratuite n'offre pas le même contrôle anti-triche qu'un serveur de confiance.** Le navigateur crée le contenu de la commande Roll20 et du récapitulatif. Les règles Firestore protègent surtout **les déductions de stocks limités** et les **prix associés aux lignes réellement déduites**. Elles ne peuvent pas garantir que tous les textes, totaux et commandes Roll20 fournis par un navigateur modifié sont authentiques, notamment pour des articles à stock illimité. Le MJ doit donc vérifier les commandes avant de les exécuter, et les joueurs authentifiés peuvent effectuer des achats sans approbation du MJ, conformément au parcours choisi.

Sur une boutique partagée uniquement entre joueurs de confiance, ce compromis permet de rester sur Spark. Pour une boutique ouverte au public nécessitant une validation anti-fraude forte, un serveur de confiance serait nécessaire.

## Vérifications effectuées avant livraison

- Syntaxe JavaScript, tests unitaires sans réseau sur la transaction (déduction, illimité, prix modifié, stock insuffisant, idempotence, séparation des groupes), et tests navigateur simulé sur le panier, les filtres, les cartes et la publication des prix MJ.
- **Les règles Firestore n'ont pas été validées dans un émulateur Firebase ni testées sur ton projet de production.** Fais le test ci-dessus avec une référence de faible valeur avant toute utilisation réelle ; si Firestore renvoie une erreur `permission-denied`, partage-la pour correction.
- Aucune donnée ni règle Firebase de ton projet n'a été modifiée directement.
