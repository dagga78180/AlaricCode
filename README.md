# AlaricCode V2 — manuel d’installation et d’exploitation

AlaricCode est la boutique web complémentaire de **COAlaric V2**. Elle affiche la sélection d’Alaric et le catalogue permanent, applique le même modèle de prix que CoFItem, gère un stock partagé via Supabase et exporte le panier sous forme de commande Roll20.

## 1. Architecture

```text
index.html              boutique joueur
stock.html              administration MJ
styles.css              présentation commune
data/
  catalogue.json        sélection/stock spécial Alaric
  catalogue-item-de-base.json  catalogue permanent
  pricing-model.json    référentiel de prix partagé avec Roll20
js/
  core.js               utilitaires, chargement JSON et Supabase
  pricing.js            moteur Q/P, rareté et arrondi commercial
  app.js                boutique, filtres, panier et export Roll20
  stock.js              console d’administration du stock
  supabase-config.js    URL + publishable key Supabase
assets/                  visuels réellement utilisés
sources/                 source catalogue auditable
tools/validate-v2.mjs   validation statique de la distribution
supabase-setup.sql      table et politiques RLS
```

La V2 isole les données du code, encapsule les pages dans leur propre scope, centralise les utilitaires partagés et retire les sources d’assets/génération inutiles à l’exécution.

## 2. Installation GitHub Pages

1. Déposer **le contenu** du dossier à la racine du dépôt publié par GitHub Pages.
2. Dans Supabase, exécuter une fois `supabase-setup.sql`.
3. Dans **Authentication > Users**, créer le ou les comptes MJ autorisés à administrer le stock. Garder les inscriptions publiques désactivées si elles ne sont pas nécessaires.
4. Renseigner dans `js/supabase-config.js` l’URL Supabase et la **publishable key** uniquement.
5. Publier ; `index.html` est la boutique et `stock.html` l’interface MJ.

La publishable key est conçue pour être exposée côté navigateur. **Ne jamais** placer une `service_role`, une secret key ou un mot de passe dans le dépôt.

## 3. Stock Supabase

La table `stocks` ne contient que les exceptions au stock illimité :

- ligne absente → stock illimité ;
- `stock = 0` → rupture ;
- `stock > 0` → quantité disponible.

La boutique lit publiquement cette table ; les écritures sont réservées aux utilisateurs Supabase authentifiés par les politiques RLS. L’administration permet recherche, filtre par source, saisie directe, `0`, illimité et actions globales sur la sélection courante.

Le navigateur rafraîchit périodiquement les stocks. Si une quantité baisse pendant qu’un joueur prépare son panier, le panier est ramené à la quantité réellement disponible.

## 4. Catalogue et contrat de données

Chaque entrée JSON doit avoir un `id` unique. Les champs d’affichage usuels sont `category`, `subcategory`, `iconKey`, `name`, `rarity`, `description` et `price`.

Pour les équipements gérés par CoFItem, `cofSpec` est le contrat machine :

```json
{
  "base": "B001",
  "quality": 1,
  "mode": "magique",
  "affixes": ["A023"],
  "name": "Nom joueur",
  "price": 123,
  "rarity": "Rare"
}
```

`quality`, `mode` et `affixes` sont omis lorsqu’ils ne s’appliquent pas. Les consommables peuvent conserver leur prix dédié et ne sont pas forcés dans le moteur de prix des équipements.

Les sources de vérité de la V2 sont :

- `sources/Catalogue_Objets_Magiques_V2.xlsx` pour l’audit humain ;
- `data/pricing-model.json` pour le calcul navigateur ;
- les deux JSON catalogue pour ce qui est effectivement proposé par le site.

## 5. Économie V2

Paliers de qualité : **Q1/Q2/Q3/Q4/Q5 = 3 / 10 / 30 / 90 / 300 PO**.

Paliers magiques : **P1/P2/P3/P4/P5 = 4 / 15 / 50 / 180 / 600 PO**.

Pour un équipement magique :

```text
coût magique = base du palier P
             × difficulté d’enchantement du support
             × coefficient de valeur de l’affixe
             × aléa du référentiel
```

La qualité utilise sa propre courbe et une influence matérielle amortie du support. Si plusieurs affixes sont présents, le moteur additionne leurs coûts magiques avant la finalisation commerciale. Le modèle contient les **569 affixes validés** ; notamment **A112 Héliolite (+1d4 Lumière) est P2**.

Le fichier `data/pricing-model.json` est byte-identique à `Catalogue_pricing_model.json` du projet Roll20 V2 afin d’éviter deux économies concurrentes.

## 6. Boutique joueur

`index.html` permet :

- navigation entre sélection d’Alaric et catalogue permanent ;
- recherche texte et filtres ;
- affichage des raretés et icônes ;
- respect du stock distant ;
- constitution du panier ;
- copie du panier au format COAlaric.

Le bouton **Copier pour Roll20** produit une commande `!co-alaric panier ...`. Le MJ colle cette commande dans Roll20 ; COAlaric prend ensuite en charge choix du PJ, achat direct, marchandage, vol, paiement et attribution par CoFItem.

Le site ne débite pas lui-même les stocks lors de la copie : l’autorité de la transaction de jeu reste le flux Roll20/MJ.

## 7. Administration MJ

`stock.html` nécessite une session Supabase authentifiée pour modifier les quantités. En lecture seule, le catalogue et les stocks restent visibles.

Bonnes pratiques :

- ne créer une ligne Supabase que pour un article limité ;
- supprimer/repasser à illimité lorsque la limitation n’est plus utile ;
- utiliser `0` pour afficher explicitement une rupture ;
- vérifier les deux sources (`alaric` et `base`) avant une opération globale.

## 8. Mise à jour du catalogue

Pour publier une nouvelle version :

1. modifier la source catalogue et le référentiel de prix ;
2. régénérer `catalogue.json`, `catalogue-item-de-base.json` et `pricing-model.json` ;
3. synchroniser le même modèle dans Roll20/CoFItem ;
4. conserver les IDs déjà publiés autant que possible, car ils servent au stock et aux paniers ;
5. exécuter le validateur V2 avant publication.

Un changement de nom est sans risque tant que l’`id` reste stable. Un changement d’`id` crée, du point de vue du stock Supabase, un nouvel article.

## 9. Validation et diagnostic

Depuis la racine du projet :

```bash
node tools/validate-v2.mjs
```

Le contrôle vérifie :

- présence des fichiers requis ;
- syntaxe JavaScript ;
- validité des JSON ;
- unicité des IDs ;
- cohérence `cofSpec.base/affixes` pour les équipements tarifés ;
- chemins locaux des pages HTML ;
- présence des variantes d’icônes référencées ;
- correction du référentiel A112/P2.

Si le catalogue ne charge pas, ouvrir la console navigateur et vérifier d’abord les fichiers du dossier `data/`. Si le stock distant ne charge pas, vérifier `js/supabase-config.js`, l’état du projet Supabase et les politiques RLS.

## 10. Compatibilité V2

Le format des deux catalogues, les IDs d’objets, `cofSpec`, les clés `localStorage` du panier/favoris et la commande COAlaric sont conservés. La refonte change l’organisation interne du projet sans imposer de migration utilisateur.

Voir `AUDIT_V2.md` pour les changements techniques et les contrôles effectués.
