# Installer AlaricCode V7 — Catalogue à coefficients validés

## Source et portée

Cette V7 repart **strictement d'AlaricCode V6.2** et applique le classeur
`COFantasy_Catalogue_Sain_Coefficients_Valides(2).xlsx` fourni par le MJ.
Le classeur est archivé dans `documentation/source/COFantasy_Catalogue_Sain_Coefficients_Valides.xlsx`.

Le site conserve : boutique joueur, 4 cartes/ligne sur ordinateur,
filtres, descriptions RP, effet court, prix Normal/PA/PC, panier avec
double confirmation, commande Roll20 à copier pour Discord, espace MJ
deux groupes, import JSON et sauvegardes/restaurations.

**Rien n'est exécuté dans Roll20.** Seule la commande texte est copiée.

## 1. Avant la mise à jour

1. Fais une sauvegarde JSON depuis l'espace MJ des deux groupes et
   conserve une copie de la V6.2 et des règles Firestore actuellement publiées.
2. Ne supprime pas la base Firestore, les stocks des groupes, les prix
   personnalisés ou les créations MJ.
3. Vérifie `config.js` pour conserver le même projet Firebase.
4. **N'applique jamais** `firestore.rules` tel quel : l'UID MJ du fichier est
   un exemple, pas ton identifiant. Garde les règles de sécurité réelles.

## 2. Installation du site statique

1. Décompresse le ZIP et publie **l'intégralité** de `AlaricCode/` avec
   les dossiers `data/`, `assets/`, `icons/` et les scripts JS.
2. Force une actualisation du navigateur (`Ctrl` + `F5`) sur `mj.html`,
   `groupe1.html` et `groupe2.html`.
3. Connecte-toi à l'espace MJ avec ton compte habituel. Contrôle les
   stocks et les prix des deux groupes.
4. Clique sur **Actualiser les prix des deux groupes** afin de publier les
   tarifs corrects dans les deux livres de prix Firestore. Sans cette
   actualisation, les achats peuvent être refusés si leurs prix ont changé.
5. Si tu obtiens `Missing or insufficient permissions`, consulte
   **GUIDE_CORRECTION_FIREBASE.md** : la mise à jour du ZIP ne change
   pas les règles Firestore distantes, et **n'autorise pas** les joueurs
   à écrire dans le livre des prix.
6. Fais un achat de test d'un objet à stock limité dans chacun des groupes.
   Contrôle la déduction du stock puis la commande Roll20 copiée.

Aucun npm, aucun déploiement de Cloud Functions et aucun changement vers Blaze.

## 3. Ce que le nouveau catalogue apporte

| Données | Nombre / valeur |
|---|---|
| Supports de base | 75 |
| Affixes techniques | 536 |
| Groupes d'effets | 201 dont 200 actifs |
| Liaisons historiques | 2 278 (2 168 actives, 109 à préciser, 1 exclue) |
| Fiches RP | 2 352 |
| Forfait qualité Q1 | 550 PA |
| Paliers P1–P5 | 450, 900, 2 700, 8 100, 24 300 PA |
| Synergie qualité × magie | 5 % × Q × P |
| Malus petit/grand bouclier | −1 / −2 |

Les **63 références de la vitrine initiale** conservent leurs identifiants
et leurs stocks. Toutes les variantes du classeur ne sont pas publiées
automatiquement : elles constituent la bibliothèque pour l'atelier MJ.

## 4. Prix et création MJ

Tarif Q0 à un affixe = **prix du classeur**, arrondi au PC à la vente.

Coût qualité Q : `(550 + 0,80 × B) × 3^(Q−1)` pour Q supérieur à 0.

Prix final = `B + (coût Q + coût P) × (1 + 0,05 × Q × P)`.
Le **support physique B n'est pas multiplié** par la synergie.

Pour plusieurs affixes, le moteur additionne les coûts P de chaque
liaison et applique la synergie avec le P maximal. C'est une **estimation
MJ**, explicitement signalée ; le classeur ne fournit pas de prix officiel
pour les combinaisons multi-affixes.

L'atelier empêche la publication des 109 liaisons « À préciser » et de
l'association exclue. Les gabarits consommables ne sont pas vendables sans
un affixe actif.

## 5. Migration des prix Firestore

Les stocks **ne sont jamais réinitialisés par la publication de la V7**.

Les prix de référence V5 et V6.2 sont reconnus : si une surcharge
Firestore est égale exactement à l'un de ces anciens prix standard,
Alaric affiche le nouveau tarif officiel. Une surcharge différente
reste un prix personnalisé pour ce groupe et n'est pas écrasée.

**Limite :** on ne peut pas distinguer une surcharge volontairement
personnalisée qui serait exactement égale à un ancien prix standard.
Vérifie ces rares cas dans le tableau MJ.

Sur la sélection initiale de 63 références, trois tarifs Q0 changent :

- Potion de soins mineure : 25 PA → 22,50 PA.
- Potion de mana mineure : 30 PA → 27 PA.
- Grenade de feu : 68,75 PA → 75,63 PA.

Les autres écarts de prix concernent surtout les variantes à affixes.
`documentation/rapports/` contient les comparatifs CSV des prix V6.2 et V7.

**Attention** : les objets personnalisés déjà publiés conservent leur prix
Firestore historique. Ils ne sont pas recalculés silencieusement. Tu
peux les recréer à partir du nouveau modèle ou ajuster leur prix dans
le tableau MJ si tu souhaites appliquer le nouveau barème.

## 6. Essais et limites

Les tests automatisés vérifient les prix officiels, le moteur Q/P,
le catalogue initial, les deux boucliers, les transactions d'achat et
la compatibilité Roll20. Ils utilisent un Firebase simulé : aucune
écriture ni vérification sur ton compte de production n'a eu lieu.

Si les règles Firestore sont encore incorrectes, **la mise en ligne de
la V7 ne corrige pas cette erreur d'autorisation**.
