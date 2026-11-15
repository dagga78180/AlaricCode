# Installation AlaricCode V6 — Catalogue RP et nouveaux prix

La V6 conserve la boutique joueur et l'espace MJ V5, remplace les données de référence par celles de **COFantasy_Catalogue_Sain_RP_Prix_Valides.xlsx** et améliore les cartes. Le site reste statique, utilisable avec **Firebase Spark**, sans Cloud Functions ni installation de Node/npm.

## 1. Sauvegarder AVANT la mise à jour

- Garde une copie de l'ancien dossier du site, de **tes règles Firestore réellement publiées** et des données des deux boutiques. Depuis l'ancienne interface MJ, fais aussi une **sauvegarde JSON** des deux groupes.
- Ne supprime aucune collection ou document Firestore existant. En particulier, les stocks et les créations MJ sont conservés.
- Vérifie `config.js` : il doit toujours cibler le même projet Firebase.
- Dans Firebase Console > Authentication, conserve la connexion MJ et l'authentification anonyme qui fonctionnent déjà dans ta version gratuite.
- **Attention :** le fichier `firestore.rules` de l'archive est un modèle avec un **UID MJ fictif**. Ne l'applique pas tel quel. Si tes règles V5 fonctionnent déjà, ne les remplace pas sans les vérifier et conserver ton UID MJ réel.

## 2. Installer les fichiers

1. Décompresse l'archive ; les fichiers du site sont dans `AlaricCode/`.
2. Mets en ligne **tout le contenu** du dossier sur ton hébergement habituel (HTML, JS, CSS, `assets/`, `icons/`, `data/`). Garde exactement l'arborescence.
3. Recharge les pages `groupe1.html`, `groupe2.html` et `mj.html` en forçant l'actualisation du navigateur si l'ancienne version s'affiche.
4. Dans `mj.html`, connecte-toi et vérifie les deux groupes. Dans le tableau de bord, actionne **« Actualiser les prix des deux groupes »** pour publier le nouveau référentiel de prix utilisé par le moteur de panier.
5. Vérifie les prix visibles dans chaque boutique **avant tout nouvel achat**.

Aucun `npm install`, aucun déploiement de fonctions et aucun passage à Blaze.

## 3. Nouveaux prix : point essentiel de la migration

- Le référentiel du classeur est désormais prioritaire pour les **63 références de départ** ; elles conservent leurs identifiants et leurs stocks Firestore.
- Pour un prix Firestore enregistré qui correspondait **exactement à l'ancien prix de base V5**, la V6 l'interprète comme une valeur héritée et utilise le **nouveau prix du classeur**. Le stock n'est pas touché.
- Pour un prix explicitement personnalisé et différent de l'ancien prix V5, la V6 **préserve ce prix par groupe**. Vérifie et modifie les exceptions dans le tableau MJ si tu souhaites les aligner sur le nouveau catalogue.
- Les objets personnalisés déjà publiés par le MJ gardent leurs propriétés/prix enregistrés : ils ne sont **pas recalculés automatiquement**, pour éviter de modifier silencieusement les créations existantes.
- Les transactions d'achat utilisent le livre des prix sécurisé de Firestore : le MJ doit le **resynchroniser** après la mise à jour. Les prix affichés seuls ne suffisent pas à rendre un nouvel achat possible.

## 4. Cartes et descriptions joueur

- **Armes** : attaque, DM, type de dégâts, effet court si utile ; description déroulante **uniquement RP**.
- **Armures** : DEF, malus lorsque applicable, effet court si utile ; description RP.
- **Accessoires, munitions et consommables** : effet court si utile ; les accessoires **n'affichent plus l'emplacement**.
- **Matériel** : description RP déroulante, sans faux encadré d'effet.
- Aucun encadré Effet si l'effet est vide. Aucune justification de calcul ou note technique ne doit être réintroduite dans la description joueur.
- Le menu **Prix** de la boutique offre trois présentations : **Normal** (PO / PA / PC), **Tout en PA** et **Tout en PC**. Il ne change que l'affichage ; les valeurs restent enregistrées en **PC entiers**. Les prix du classeur ont été arrondis au PC à la vente lorsqu'ils comportaient des fractions plus petites.

## 5. Référentiel et atelier MJ

- Le fichier source est conservé en lecture seule dans `documentation/source/`.
- Les fichiers `data/catalogue-objets-v2.json`, `catalogue-affixes-v2.json`, `catalogue-liaisons-v2.json` et `catalogue-rp-nouveau.json` contiennent le nouveau catalogue.
- Les **63 articles de départ** restent la vitrine initiale. Les nombreuses variantes du classeur sont une **bibliothèque pour l'atelier MJ**, non un réapprovisionnement automatique ni une publication massive.
- Les **consommables définis comme gabarits** ne sont pas vendables seuls sans association valide.
- Dans l'atelier, **un objet + un affixe** peut prendre son prix exact du classeur. La **qualité** utilise le supplément officiel du modèle Q ; plusieurs affixes additionnent leurs surcoûts et le résultat est **signalé comme estimation**, car le classeur ne donne pas de prix officiel pour toutes les combinaisons.
- Les associations marquées « À préciser » ou « Exclu » ne doivent pas être publiées comme des variantes validées.
- L'ajout / la suppression / la modification de stocks et de prix en parallèle des deux groupes, l'import JSON avec traitement individuel des doublons, et l'export / la restauration restent présents.

## 6. Test rapide après installation

1. Vérifie dans chaque groupe que les objets de base affichent les **nouveaux noms RP, les prix et les descriptions**.
2. Ouvre une armure matelassée : sa description ne doit plus afficher de phrases telles que « Bonus de DEF de base » ; ses valeurs techniques doivent rester dans les encadrés.
3. Ouvre un accessoire : il ne doit plus avoir d'encadré « Emplacement ».
4. Change l'affichage des prix Normal / PA / PC et contrôle la conversion d'un article.
5. Depuis MJ, contrôle le prix d'une création qualité +1 et, si applicable, l'estimation de plusieurs affixes.
6. Teste un **achat très limité** dans chaque groupe après synchronisation du livre des prix, puis vérifie stock précédent → stock nouveau et le bon récapitulatif.
7. Utilise « Copier la commande Roll20 » et colle-la dans un champ texte pour vérifier qu'elle est complète. **Ne l'exécute pas automatiquement** ; elle doit être envoyée au MJ sur Discord.

## 7. Limites et sécurité

- Version gratuite Firebase Spark, sous réserve de ses limites d'usage.
- Le navigateur et les tests fournis ont fonctionné avec un **Firebase simulé**. Rien n'a été modifié ou testé directement sur ton compte Firebase en production.
- La commande Roll20 est un simple texte copié par le joueur. Le MJ vérifie ce qu'il reçoit sur Discord avant exécution dans Roll20.
- Les sauvegardes/restaurations peuvent écraser des stocks : les lancer hors séance, sans achats simultanés.

Les guides des versions précédentes se trouvent dans `documentation/historique/`.
