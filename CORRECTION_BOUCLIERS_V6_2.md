# AlaricCode V6.2 — Correction des malus de bouclier

Correction demandée par le MJ, qui prime sur le tableau Excel livré précédemment :

- **Petit bouclier (BCL-01)** : **DEF +1**, **MALUS −1**.
- **Grand bouclier (BCL-02)** : **DEF +2**, **MALUS −2**.

Les malus sont enregistrés sous forme d'entiers positifs (1 et 2) dans
`armorMalus` et affichés négativement sur les cartes. Les variantes à affixes
héritent de cette valeur.

Le classeur d'origine dans `documentation/source/` est conservé **inchangé**,
à titre de trace du fichier reçu : il indiquait 0 pour ces malus.
La présente correction explicite (et les JSON V6.2) prévaut sur cet ancien état.

Aucune modification des prix, des stocks Firestore, du moteur d'achat,
de Roll20 ou des règles de sécurité.

Installation : remplacer les fichiers statiques du site par ceux du ZIP.
Aucune modification des règles Firestore n'est requise pour ce correctif.
Le refus `Missing or insufficient permissions` pour la publication des prix
reste un problème d'autorisation MJ et doit être traité avec
`GUIDE_CORRECTION_FIREBASE.md`.
