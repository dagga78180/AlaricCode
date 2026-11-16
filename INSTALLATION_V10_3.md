# AlaricCode V10.3 — Gestion MJ, tarifs et rayons

Cette version conserve le thème **L'Écrin des Merveilles** et le parcours joueur : panier → double confirmation → mise à jour des stocks Firestore → commande Roll20 à copier sur Discord. **Aucun Cloud Function ni forfait Blaze n'est nécessaire** pour ce fonctionnement, sous réserve des quotas gratuits de Firebase Spark.

## 1 — Avant tout : sauvegarder

1. Sauvegarde les fichiers actuellement publiés sur GitHub Pages et les règles Firestore en vigueur.
2. Connecte-toi à `mj.html` et exporte une sauvegarde JSON des deux groupes dans **Sauvegardes**.
3. Vérifie que ton projet Firebase utilise toujours le bon compte MJ et que l'authentification anonyme des joueurs est activée.

## 2 — Mettre les règles Firestore à jour (obligatoire pour les promotions)

Dans la console Firebase : **Firestore Database → Règles**. La V10.3 étend les documents existants :

- `groups/{groupe}/storefront/priceBook` : `prices` + **`promoPrices`** (montants en PC entiers).
- `groups/{groupe}/storefront/featured` : `itemIds`, `secretIds` + **`discounts`** (pourcentages MJ).
- Les commandes et diminutions de stock peuvent être validées contre le prix standard **ou** le prix promotionnel publié.

**Très important :** le fichier `firestore.rules` de l'archive contient `REMPLACE_PAR_TON_UID_MJ`. Avant de publier ces règles, remplace cette valeur par l'UID réel de ton utilisateur MJ dans `isMJ()` (ou conserve ta propre fonction `isMJ()` si elle est déjà correcte). Ne publie **jamais** les règles avec l'UID fictif. Compare et fusionne les autres règles personnalisées si ton projet en utilise.

Les joueurs peuvent seulement *lire* les prix ; seul le MJ peut écrire les livres de prix et les remises.

## 3 — Publier le site

1. Copie les fichiers V10.3 dans le dépôt GitHub Pages (`AlaricCode`). Garde la configuration Firebase correspondant à **ton** projet dans `config.js`.
2. Publie le dépôt, puis actualise le navigateur avec **Ctrl + F5**.
3. Connecte-toi à `mj.html`. Si les messages d'erreur sont `Missing or insufficient permissions`, vérifie l'UID, la publication des nouvelles règles, et l'authentification MJ.

## 4 — Réparer tous les tarifs officiels applicables

Depuis **Espace MJ → Tableau de bord → Réparer les tarifs officiels** :

1. Choisis en haut **Les deux groupes**, ou un seul.
2. L'option « inclure les créations Q0 à affixe unique possédant un tarif officiel » est activée par défaut. Elle est nécessaire notamment pour la variante `DST-01|N32` (arc court à monture compacte / encoche rapide selon la version du nom RP).
3. Clique sur **Comparer les tarifs**. Examine les différences avant/après pour chaque groupe.
4. Clique sur **Restaurer les prix officiels** puis confirme. L'écriture des prix et du livre de prix est faite en un lot Firestore, sans écriture sur les stocks.

L'exemple `DST-01|N32` a un prix officiel de **50 585 PC**, soit **5 PO · 5 PA · 85 PC**. Si une ancienne surcharge est présente, elle est écrasée lors de cette réparation. Les créations à plusieurs affixes ou ne correspondant à aucun tarif officiel ne sont pas réévaluées arbitrairement. Les créations à affixe unique qui correspondent à un tarif officiel sont mises à jour si l'option est cochée ; elles peuvent avoir été personnalisées auparavant, **inspecte donc l'aperçu**.

Le bouton **Actualiser les prix des deux groupes**, distinct, republie le prix en vigueur sans remettre les anciennes surcharges à zéro. Pour corriger un ancien prix faux, utilise **Réparer les tarifs officiels**.

## 5 — Catalogue MJ : filtres et raccourcis

Dans **Catalogue et stocks** : recherche, catégorie, rareté, état du stock, rayon (Boutique / Promotions / Secret), prix minimum et maximum. Deux raccourcis sur chaque ligne permettent de préparer une promotion ou une marchandise secrète. La sélection du groupe **Groupe 1 / Groupe 2 / Les deux** reste valable.

## 6 — Promotions

1. Dans **Catalogue et stocks**, clique sur **↳ Promotion** pour un article, ou retrouve-le via **Configuration → Rayons spéciaux**.
2. Choisis le groupe ou les deux. Un nouvel article reçoit une remise proposée de **10 %**, modifiable entre **1 et 90 %** ; les remises existantes sans pourcentage doivent être définies manuellement.
3. Chaque groupe possède son propre pourcentage. Vérifie les prix calculés affichés en dessous.
4. Clique sur **Enregistrer les rayons**. Firestore publie les remises **et** les prix promotionnels utilisés lors de l'achat.
5. L'article est transféré de la **Boutique** au rayon **Promotions**, sans duplication ni changement de stock. Les cartes et le panier restent ceux de la boutique normale. Le rayon Promotions affiche l'ancien tarif barré, le montant réduit et le pourcentage.

Les prix réduits sont arrondis au **PC entier**. La commande Roll20 reçoit le prix effectivement payé. Si une remise est supprimée, l'article revient dans la boutique normale après publication.

## 7 — Marchandises secrètes

Dans **Configuration → Rayons spéciaux**, choisis les objets, puis définis ou change une phrase secrète d'au moins 12 caractères, difficile à deviner. Enregistre pour le ou les groupes sélectionnés. Les joueurs doivent saisir cette phrase pour ouvrir le rayon.

**Limite de confidentialité importante :** l'accès au rayon est filtré par un document Firestore indexé par empreinte SHA-256. Il ne s'agit pas d'une authentification serveur inviolable : des IDs ou des descriptions déjà présents dans les données publiques peuvent rester techniquement accessibles. Pour de véritables secrets MJ, ne place pas d'informations confidentielles dans le catalogue public. Ne mets jamais le mot de passe en clair dans `config.js`, dans les sources HTML ou dans Discord public.

## 8 — Tests de validation recommandés avant les joueurs

1. Vérifie que l'arc `DST-01|N32` coûte 5 PO · 5 PA · 85 PC dans les deux groupes après correction, s'il est présent.
2. Mets un objet en promotion à -10 % : vérifie l'ancien prix barré, le prix réduit, et son absence de la boutique normale.
3. Teste la double confirmation d'un achat promotionnel à **petit stock**, puis vérifie la déduction et la commande Roll20 copiée.
4. Essaie un mauvais mot de passe secret (refus), puis le bon (accès accordé).
5. Vérifie qu'un article non promotionné conserve son prix normal et que la gestion des prix et stocks des deux groupes reste indépendante.

Les tests automatisés du ZIP fonctionnent avec `node --test tests/*.test.js` si Node.js est installé sur ton ordinateur. Ils ne remplacent pas un test de ta vraie configuration Firebase.
