# AlaricCode — Armes de jet traitées comme des munitions (V10.6)

## Modifications
- Couteau de lancer `DST-06` (10 PC), Hachette `DST-07` (25 PC), Javelot `DST-08` (15 PC).
- Les trois apparaissent dans la sélection de base de la boutique : 55 articles.
- Armes de jet pour Roll20 (et donc leurs compteurs de perte/récupération) ; tarifs et affixes comme des munitions pour Alaric.
- Qualité Q interdite ; 22 affixes de munitions autorisés par arme ; un affixe par variante.
- 66 variantes magiques ajoutées au catalogue, et 14 anciennes variantes permanentes retirées de la vente, conservées dans les données historiques.
- Catalogue JSON et référentiel de prix en cohérence avec `COFantasy_Catalogue_Armes_de_jet_Munitions.xlsx`.
- Nouvelle icône DST-06 issue de la silhouette de dague existante et intégrée à la galerie.

## Déploiement
1. Sauvegarde la version du site et les données Firestore.
2. Déploie **les fichiers statiques du site** sur Firebase Hosting / l'hébergement actuel (pas seulement les `.json`).
3. Connecte-toi à l'espace **MJ**. Charge les deux groupes puis lance la réparation des prix officiels pour traiter d'éventuelles anciennes surcharges (Hachette/Javelot de 1,50 PA). Vérifie avant de confirmer.
4. Vérifie les disponibilités, puis publie/actualise les livres de prix des deux groupes. Les variantes enchantées ne sont pas ajoutées au stock par défaut : crée celles que tu souhaites vendre dans l'atelier MJ, avec leur quantité.
5. Pour faire fonctionner les piles et la perte à l'utilisation dans Roll20, utilise aussi les scripts `COFantasyItems_Armes_de_jet_V5.3.48.js` et `COFantasy_Armes_de_jet_V2.1.44.js` du pack précédent.

## Tests recommandés
- Rechercher « couteau », « hachette », « javelot » dans les deux boutiques.
- Panier ×5 couteaux non magiques : total 50 PC, puis commande compatible avec Roll20.
- Dans l'atelier MJ, création d'une hachette avec affixe AM_EXP_1 : prix 60,75 PA ; aucun Q ni second affixe autorisé.
- Test d'achat, attribution de 5 armes et jets avec perte/récupération dans une campagne Roll20 de test.

**Important :** ce ZIP modifie le code local fourni, il ne met pas à jour un site en ligne ni Firestore automatiquement.
